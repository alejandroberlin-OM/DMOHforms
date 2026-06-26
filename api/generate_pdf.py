# api/generate_pdf.py
# Vercel Python serverless function
# Fills the actual CBCRP PDF form using pypdf
# Section 2 (Patient PHI) is intentionally left blank

from http.server import BaseHTTPRequestHandler
import json
import os
import io
import urllib.request

try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    from PyPDF2 import PdfReader, PdfWriter  # fallback


def get_pdf_bytes():
    """Load the original CCO CBCRP PDF. Try local first, then fetch from CCO."""
    # Try to read from public folder (relative to project root)
    candidates = [
        os.path.join(os.path.dirname(__file__), '..', 'public', 'CBCRP_Request_Form.pdf'),
        os.path.join('/var/task', 'public', 'CBCRP_Request_Form.pdf'),
    ]
    for path in candidates:
        if os.path.exists(path):
            with open(path, 'rb') as f:
                return f.read()

    # Fall back: fetch directly from Ontario Health
    url = "https://www.cancercareontario.ca/sites/ccocancercare/files/assets/CBCRP_Request_Form.pdf"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as response:
        return response.read()


def fill_pdf(provider, f):
    """
    Fill the CBCRP AcroForm fields.
    provider: dict with physician credentials
    f: dict with form data (clinical fields)
    Section 2 (PHI) fields are intentionally NOT filled.
    """
    pdf_bytes = get_pdf_bytes()
    reader = PdfReader(io.BytesIO(pdf_bytes))
    writer = PdfWriter()
    writer.append(reader)

    # Remove XFA layer so all PDF viewers show the AcroForm (filled) layer
    try:
        if "/AcroForm" in writer._root_object:
            writer._root_object["/AcroForm"].pop("/XFA", None)
    except Exception:
        pass

    def v(key, default=""):
        return str(f.get(key) or default).strip()

    prior = f.get("priorTx", [])

    def tx(i, key):
        """Get prior treatment field value for row i (0-indexed)"""
        if i < len(prior) and prior[i]:
            return str(prior[i].get(key, "") or "").strip()
        return ""

    # ── Section 1: Applicant Information ──────────────────────────────────
    s1 = {
        "form1[0].Page1[0].MDFirstName[0]":     provider.get("firstName", ""),
        "form1[0].Page1[0].MDLastName[0]":      provider.get("lastName", ""),
        "form1[0].Page1[0].CPSONo\\.[0]":        provider.get("cpso", ""),
        "form1[0].Page1[0].MDTelephone[0]":     provider.get("tel", ""),
        "form1[0].Page1[0].MDFax[0]":           provider.get("fax", ""),
        "form1[0].Page1[0].MDemail[0]":         provider.get("email", ""),
        "form1[0].Page1[0].HospRCC[0]":         provider.get("hospital", ""),
    }

    # ── Section 2: Patient Information ─ INTENTIONALLY LEFT BLANK ─────────
    # Do NOT fill: PatientFirstName, PatientLastName, PatientDOB, OHIN,
    # PatientGender, PatientHeight, PatientWeight, PatientBSA
    # Physician must complete these manually on the printed form.

    # ── Section 3: Patient Medical History ────────────────────────────────
    s3_text = {
        "form1[0].Page2[0].CancerDiagnosis[0]":        v("cancerDx"),
        "form1[0].Page2[0].GradeofCancer[0]":          v("grade"),
        "form1[0].Page2[0].CancerStage[0]":            v("stage"),
        "form1[0].Page2[0].PerformanceStatusScore[0]": v("perfScore"),
        "form1[0].Page2[0].RelevantComorbidities[0]":  v("comorbidities"),
        "form1[0].Page2[0].ConcomitantMedications[0]": v("concomitantMeds"),
    }

    # Prior Treatment Table — 5 rows available in the PDF
    tx_fields = {}
    if len(prior) > 0:
        tx_fields.update({
            "form1[0].Page2[0].Table1TxHistory[0].Treatment1[0].StartDateTx1[0]": tx(0, "startDate"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment1[0].Treatment1[0]":   tx(0, "drug"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment1[0].DoseTx1[0]":      tx(0, "dose"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment1[0].FreqTx1[0]":      tx(0, "freq"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment1[0].CyclesTx1[0]":    tx(0, "duration"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment1[0].ResponseTx1[0]":  tx(0, "response"),
        })
    if len(prior) > 1:
        tx_fields.update({
            "form1[0].Page2[0].Table1TxHistory[0].Treatment2[0].StartDateTx2[0]": tx(1, "startDate"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment2[0].Treatment2[0]":   tx(1, "drug"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment2[0].DoseTx2[0]":      tx(1, "dose"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment2[0].FreqTx2[0]":      tx(1, "freq"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment2[0].CyclesTx2[0]":    tx(1, "duration"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment2[0].ResponseTx2[0]":  tx(1, "response"),
        })
    if len(prior) > 2:
        tx_fields.update({
            "form1[0].Page2[0].Table1TxHistory[0].Treatment3[0].StartDateTx3[0]": tx(2, "startDate"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment3[0].Treatment3[0]":   tx(2, "drug"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment3[0].DoseTx3[0]":      tx(2, "dose"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment3[0].FreqTx3[0]":      tx(2, "freq"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment3[0].DurationTx3[0]":  tx(2, "duration"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment3[0].ResponseTx3[0]":  tx(2, "response"),
        })
    if len(prior) > 3:
        tx_fields.update({
            "form1[0].Page2[0].Table1TxHistory[0].Treatment4[0].StartDateTx4[0]": tx(3, "startDate"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment4[0].Treatment4[0]":   tx(3, "drug"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment4[0].DoseTx4[0]":      tx(3, "dose"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment4[0].FreqTx4[0]":      tx(3, "freq"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment4[0].DurationTx4[0]":  tx(3, "duration"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment4[0].ResponseTx4[0]":  tx(3, "response"),
        })
    if len(prior) > 4:
        tx_fields.update({
            "form1[0].Page2[0].Table1TxHistory[0].Treatment5[0].StartDateTx5[0]": tx(4, "startDate"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment5[0].Treatment5[0]":   tx(4, "drug"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment5[0].DoseTx5[0]":      tx(4, "dose"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment5[0].FreqTx5[0]":      tx(4, "freq"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment5[0].DurationTx5[0]":  tx(4, "duration"),
            "form1[0].Page2[0].Table1TxHistory[0].Treatment5[0].ResponseTx5[0]":  tx(4, "response"),
        })

    # ── Section 4: Treatment Regimen ──────────────────────────────────────
    s4_text = {
        "form1[0].Page3[0].GenericName[0]":              v("drugGeneric"),
        "form1[0].Page3[0].BrandName[0]":               v("drugBrand"),
        "form1[0].Page3[0].b\\.DIN[0]":                  v("din"),
        "form1[0].Page3[0].e\\.PlannedTxRegimen[0]":     v("plannedRegimen"),
        "form1[0].Page3[0].f\\.modification[0]":         v("regimenRationale"),
        "form1[0].Page3[0].No\\.ofCycles[0]":            v("durationCycles"),
        "form1[0].Page3[0].No\\.ofMonths[0]":            v("durationMonths"),
        "form1[0].Page3[0].h\\.AnticipatedStartDate[0]": v("startDate"),
        "form1[0].Page3[0].i\\.TxAssessment[0]":         v("responseAssessment"),
        "form1[0].Page3[0].j\\.TxStopCriteria[0]":       v("stoppingCriteria"),
        "form1[0].Page3[0].k\\.TxCost[0]":               v("treatmentCost"),
        "form1[0].Page3[0].RXOutPatientHospitalName[0]": v("txLocationSpec"),
        "form1[0].Page3[0].FundingSpecified[0]":         v("currentFundingDetail"),
    }

    # ── Section 5: Clinical Rationale ──────────────────────────────────────
    s5_text = {
        "form1[0].Page4[0].Incidence[0]":                  v("cancerIncidence"),
        "form1[0].Page4[0].Estimate[0]":                   v("ontarioEstimate"),
        "form1[0].Page4[0].RarecircumstanceRationale[0]":  v("rareCircumstance"),
        "form1[0].Page4[0].EstimateWithoutTx[0]":          v("survivalWithout"),
        "form1[0].Page4[0].EstimateWithTx[0]":             v("survivalWith"),
        "form1[0].Page4[0].OtherTxOptions[0]":             v("whyOthersNA"),
        "form1[0].Page4[0].TextField1[0]":                 v("expectedBenefits"),
        "form1[0].Page4[0].OtherSpecified[0]":             v("clinicalTrialNOther"),
        "form1[0].Page5[0].QoLSpecified[0]":               v("qolImprovement"),
        "form1[0].Page5[0].EvidenceSummary[0]":            v("publishedEvidence"),
        "form1[0].Page5[0].ContraIndSpecified[0]":         v("contraindicationsDetail"),
        "form1[0].Page5[0].SafetyToxicity[0]":             v("safetyProfile"),
        "form1[0].Page5[0].OtherSpecified[0]":             v("specialistRecDetail"),
        "form1[0].Page5[0].AltTxPlan[0]":                  v("ifNotApproved"),
        "form1[0].Page5[0].AdditionalRationale[0]":        v("additionalInfo"),
    }

    # ── Section 7: Date ────────────────────────────────────────────────────
    s7 = {
        "form1[0].Page6[0].DateCompleted[0]": v("dateCompleted"),
    }

    # Combine all text fields
    all_text_fields = {}
    all_text_fields.update(s1)
    all_text_fields.update(s3_text)
    all_text_fields.update(tx_fields)
    all_text_fields.update(s4_text)
    all_text_fields.update(s5_text)
    all_text_fields.update(s7)

    # Fill text fields page by page
    for page_num, page in enumerate(writer.pages):
        try:
            writer.update_page_form_field_values(
                page,
                all_text_fields,
                auto_regenerate=False,
            )
        except Exception:
            pass  # Skip pages where fields don't exist

    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))

            provider = body.get('provider', {})
            form_data = body.get('formData', {})

            pdf_bytes = fill_pdf(provider, form_data)

            self.send_response(200)
            self.send_header('Content-Type', 'application/pdf')
            self.send_header('Content-Disposition',
                             'attachment; filename="CBCRP_Request_Form_Prefilled.pdf"')
            self.send_header('Content-Length', str(len(pdf_bytes)))
            self.end_headers()
            self.wfile.write(pdf_bytes)

        except Exception as e:
            error_msg = json.dumps({'error': str(e)}).encode()
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(error_msg)))
            self.end_headers()
            self.wfile.write(error_msg)

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        pass  # Suppress default logging
