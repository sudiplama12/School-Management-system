import { jsPDF } from "jspdf";

// One A4 portrait card per student, drawn with jsPDF in millimetres so the
// family's download and the office printout are the same document. Every number
// on it is already computed by the backend; this only lays the card out.
const MARGIN = 14;
const WIDTH = 210;
const HEIGHT = 297;
const RIGHT = WIDTH - MARGIN;

const COLUMNS = [
  { label: "Subject", x: MARGIN + 2, width: 54, align: "left" },
  { label: "Theory", x: 70, width: 16, align: "center" },
  { label: "Practical", x: 88, width: 18, align: "center" },
  { label: "Total", x: 108, width: 16, align: "center" },
  { label: "%", x: 126, width: 16, align: "center" },
  { label: "Grade", x: 144, width: 14, align: "center" },
  { label: "G.P.", x: 160, width: 14, align: "center" },
  { label: "P.M.", x: 174, width: 12, align: "center" },
  { label: "Cr.", x: 188, width: 8, align: "center" },
];

const GRADE_KEY =
  "Grades: A+ 90-100 (4.0) · A 80-89 (3.6) · B+ 70-79 (3.2) · B 60-69 (2.8) · C+ 50-59 (2.4) · C 40-49 (2.0) · D 35-39 (1.6) · F below 35. Pass mark is 35% of each paper.";

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// An absent paper prints as Ab rather than a zero: it is still owed, and the
// backend already left it out of the GPA.
const printed = (row) =>
  row.absent
    ? { theory: "Ab", practical: "Ab", total: "Ab", percentage: "-", grade: "Ab", point: "-", pass: "-" }
    : {
        theory: row.theory ?? "-",
        practical: row.practical ?? "-",
        total: row.total ?? "-",
        percentage: row.percentage ?? "-",
        grade: row.grade || "-",
        point: row.gradePoint ?? "-",
        pass: row.passMarks ?? "-",
      };

const escape = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// The printout opens its own document, exactly like the fee statement, so the
// portal's animated chrome and theme never bleed into what comes out of the
// printer. One A4 portrait page per card.
export const buildCardHtml = ({ school, result }) => {
  const rows = (result.subjects || [])
    .map(
      (row) => `
        <tr>
          <td class="subject">${escape(row.subjectName)}</td>
          <td>${row.absent ? "Ab" : row.theory ?? "-"}</td>
          <td>${row.absent ? "Ab" : row.practical ?? "-"}</td>
          <td class="strong">${row.absent ? "Ab" : row.total ?? "-"}</td>
          <td>${row.absent ? "-" : row.percentage ?? "-"}</td>
          <td class="strong">${escape(row.grade || "-")}</td>
          <td>${row.absent ? "-" : row.gradePoint ?? "-"}</td>
          <td>${row.passMarks ?? "-"}</td>
          <td>${row.credits ?? "-"}</td>
          <td class="remarks">${escape(row.remarks || "")}</td>
        </tr>`
    )
    .join("");

  const attendance = result.attendance?.total
    ? `${result.attendance.present + result.attendance.late} / ${result.attendance.total} (${result.attendance.percentage}%)`
    : "-";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Grade sheet — ${escape(result.studentId)}</title>
    <style>
      @page { size: A4 portrait; margin: 14mm; }
      * { box-sizing: border-box; }
      body {
        font-family: Helvetica, Arial, sans-serif;
        color: #0f172a;
        margin: 24px auto;
        max-width: 780px;
        font-size: 12px;
      }
      .masthead { display: flex; justify-content: space-between; align-items: flex-start;
        border-bottom: 2px solid #0f766e; padding-bottom: 10px; }
      .short { font-size: 26px; font-weight: 700; letter-spacing: 1px; }
      .school { font-size: 14px; font-weight: 700; margin-top: 2px; }
      .tagline { font-size: 10px; color: #475569; margin-top: 2px; }
      .meta { text-align: right; font-size: 11px; color: #475569; }
      .meta .doc { font-size: 16px; font-weight: 700; color: #0f172a; }
      .band { background: #f1f5f9; text-align: center; font-weight: 700; font-size: 14px;
        letter-spacing: 1px; padding: 8px; margin: 14px 0 12px; }
      .who { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; margin-bottom: 14px; }
      .who div { display: flex; gap: 6px; }
      .who b { min-width: 92px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #0f766e; color: #fff; font-size: 10px; text-transform: uppercase;
        padding: 6px 4px; }
      th.subject, td.subject { text-align: left; }
      td { border-bottom: 1px solid #e2e8f0; padding: 5px 4px; text-align: center; }
      td.strong { font-weight: 700; }
      td.remarks { text-align: left; font-size: 10px; color: #475569; max-width: 120px; }
      .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
        background: #ecfdf5; padding: 12px; margin-top: 14px; text-align: center; }
      .summary span { display: block; font-size: 10px; text-transform: uppercase; color: #475569; }
      .summary b { font-size: 16px; }
      .key { font-size: 9px; color: #64748b; margin-top: 8px; line-height: 1.5; }
      .note { margin-top: 12px; font-size: 11px; }
      .note b { display: block; font-size: 10px; text-transform: uppercase; color: #475569; }
      .sign { display: flex; justify-content: space-between; margin-top: 46px; gap: 40px; }
      .sign div { flex: 1; border-top: 1px solid #94a3b8; padding-top: 4px; font-size: 10px;
        text-align: center; }
      .foot { margin-top: 18px; border-top: 1px solid #cbd5e1; padding-top: 8px;
        font-size: 9px; color: #64748b; display: flex; justify-content: space-between; }
    </style>
  </head>
  <body>
    <div class="masthead">
      <div>
        <div class="short">${escape(school?.shortName || "School")}</div>
        <div class="school">${escape(school?.name || "")}</div>
        <div class="tagline">${escape([school?.tagline, school?.address, school?.phone].filter(Boolean).join(" · "))}</div>
      </div>
      <div class="meta">
        <div class="doc">Grade Sheet</div>
        <div>${escape(result.term?.name || "")} — ${escape(result.term?.academicYear || "")}</div>
        <div>Session ${escape(school?.session || result.term?.academicYear || "")}</div>
      </div>
    </div>

    <div class="band">STUDENT PROGRESS REPORT CARD</div>

    <div class="who">
      <div><b>Student</b><span>${escape(result.studentName)}</span></div>
      <div><b>Student ID</b><span>${escape(result.studentId)}</span></div>
      <div><b>Class</b><span>${escape(result.className)}</span></div>
      <div><b>Roll No.</b><span>${escape(result.rollNumber || "-")}</span></div>
      <div><b>Exam</b><span>${escape(result.term?.name)} (${escape(result.term?.kind || "terminal")})</span></div>
      <div><b>Venue</b><span>${escape(result.term?.venue || "-")}</span></div>
      <div><b>Term dates</b><span>${result.term?.startDate ? `${formatDate(result.term.startDate)} → ${formatDate(result.term.endDate)}` : "-"}</span></div>
      <div><b>Attendance</b><span>${escape(attendance)}</span></div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="subject">Subject</th>
          <th>Theory</th>
          <th>Practical</th>
          <th>Total</th>
          <th>%</th>
          <th>Grade</th>
          <th>G.P.</th>
          <th>P.M.</th>
          <th>Cr.</th>
          <th class="remarks">Remarks</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="summary">
      <div><span>Obtained</span><b>${result.obtained ?? 0} / ${result.maximum ?? 0}</b></div>
      <div><span>GPA</span><b>${result.gpa ?? 0}</b></div>
      <div><span>Division</span><b>${escape(result.division || "-")}</b></div>
      <div><span>Result</span><b>${escape(String(result.result || "pending").toUpperCase())}</b></div>
    </div>

    <p class="key">${escape(GRADE_KEY)}</p>

    ${
      result.officeRemarks
        ? `<div class="note"><b>Office remarks</b>${escape(result.officeRemarks)}</div>`
        : ""
    }

    <div class="sign">
      <div>Class Teacher</div>
      <div>Principal / Coordinator</div>
    </div>

    <div class="foot">
      <span>Generated by the Smart School Management System. Absent papers print as Ab and are excluded from the GPA until the paper is sat.</span>
      <span>Published ${formatDate(result.publishedAt)}</span>
    </div>
  </body>
</html>`;
};

export const printReportCard = ({ school, result }) => {
  const win = window.open("", "_blank", "width=900,height=1100");

  if (!win) {
    window.alert("Allow pop-ups for this site to print the grade sheet.");
    return;
  }

  win.document.write(buildCardHtml({ school, result }));
  win.document.close();

  win.onload = () => {
    win.focus();
    win.print();
    win.onafterprint = () => win.close();
  };
};

export const downloadReportCard = ({ school, result }) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let y = MARGIN + 5;

  const draw = (value, x, size = 9, style = "normal", align = "left") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.text(String(value ?? ""), x, y, { align });
  };

  const field = (caption, value, x) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`${caption}:`, x, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value ?? "-"), x + doc.getTextWidth(`${caption}: `), y);
  };

  const heading = () => {
    doc.setFillColor(15, 118, 110);
    doc.rect(MARGIN, y - 4, RIGHT - MARGIN, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    for (const column of COLUMNS) {
      doc.text(column.label, column.x + column.width / 2, y, {
        align: column.align === "left" ? "left" : "center",
      });
    }

    doc.setTextColor(15, 23, 42);
    y += 5;
  };

  // ---------------------------------------------------------------- masthead
  draw(school?.shortName || "School", MARGIN, 18, "bold");
  y += 5;
  draw(school?.name || "", MARGIN, 10.5, "bold");
  y += 4;
  draw(school?.tagline || "", MARGIN, 8);
  y += 3.5;
  draw([school?.address, school?.phone, school?.email].filter(Boolean).join("  ·  "), MARGIN, 7.5);

  y = MARGIN + 5;
  draw("Grade Sheet", RIGHT, 13, "bold", "right");
  y += 5;
  draw(`${result.term?.name || ""} — ${result.term?.academicYear || ""}`, RIGHT, 9, "normal", "right");
  y += 4;
  draw(`Generated ${formatDate(new Date())}`, RIGHT, 7.5, "normal", "right");

  y = MARGIN + 21;
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, RIGHT, y);

  // ------------------------------------------------------------ title band
  y += 10;
  doc.setFillColor(241, 245, 249);
  doc.rect(MARGIN, y - 6, RIGHT - MARGIN, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("STUDENT PROGRESS REPORT CARD", WIDTH / 2, y, { align: "center" });

  // ----------------------------------------------------------- student block
  const mid = MARGIN + 92;

  y += 11;
  field("Student", result.studentName || "-", MARGIN);
  field("Student ID", result.studentId, mid);

  y += 5;
  field("Class", result.className, MARGIN);
  field("Roll No.", result.rollNumber || "-", mid);

  y += 5;
  field("Exam", `${result.term?.name || "-"} (${result.term?.kind || "terminal"})`, MARGIN);
  field("Venue", result.term?.venue || "-", mid);

  y += 5;
  field(
    "Term dates",
    result.term?.startDate
      ? `${formatDate(result.term.startDate)} to ${formatDate(result.term.endDate)}`
      : "-",
    MARGIN
  );
  field(
    "Attendance",
    result.attendance?.total
      ? `${result.attendance.present + result.attendance.late}/${result.attendance.total} (${result.attendance.percentage}%)`
      : "-",
    mid
  );

  // ------------------------------------------------------------ marks table
  y += 8;
  heading();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  for (const [index, row] of (result.subjects || []).entries()) {
    if (y > HEIGHT - 46) {
      doc.addPage();
      y = MARGIN + 8;
      heading();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(MARGIN, y - 3.2, RIGHT - MARGIN, 5, "F");
    }

    const values = printed(row);

    doc.setFont("helvetica", "normal");
    doc.text(String(row.subjectName || "").slice(0, 32), COLUMNS[0].x, y);

    for (const [position, value] of [
      values.theory,
      values.practical,
      values.total,
      values.percentage,
      values.grade,
      values.point,
      values.pass,
      row.credits ?? "-",
    ].entries()) {
      const column = COLUMNS[1 + position];

      doc.text(String(value), column.x + column.width / 2, y, { align: "center" });
    }

    y += 5;
  }

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y - 1, RIGHT, y - 1);

  // ----------------------------------------------------------- result panel
  y += 7;

  if (y > HEIGHT - 40) {
    doc.addPage();
    y = MARGIN + 10;
  }

  doc.setFillColor(236, 253, 245);
  doc.rect(MARGIN, y - 5, RIGHT - MARGIN, 14, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`Obtained  ${result.obtained ?? 0} / ${result.maximum ?? 0}`, MARGIN + 3, y);
  doc.text(`GPA  ${result.gpa ?? 0}`, MARGIN + 48, y);
  doc.text(`Division  ${result.division || "-"}`, MARGIN + 80, y);
  doc.text(
    `Result  ${String(result.result || "pending").toUpperCase()}`,
    MARGIN + 132,
    y
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  y += 5;
  doc.text(GRADE_KEY, MARGIN, y);

  const remarks = (result.subjects || []).filter((row) => row.remarks);

  y += 6;

  if (remarks.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Subject remarks:", MARGIN, y);
    doc.setFont("helvetica", "normal");

    for (const row of remarks.slice(0, 8)) {
      y += 4;

      if (y > HEIGHT - 40) {
        doc.addPage();
        y = MARGIN + 8;
      }

      const line = doc.splitTextToSize(`${row.subjectName}: ${row.remarks}`, RIGHT - MARGIN);

      doc.text(line, MARGIN, y);
      y += (line.length - 1) * 3.4;
    }
  }

  if (result.officeRemarks) {
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Office remarks:", MARGIN, y);
    doc.setFont("helvetica", "normal");

    const lines = doc.splitTextToSize(String(result.officeRemarks), RIGHT - MARGIN);

    y += 4;
    doc.text(lines, MARGIN, y);
    y += (lines.length - 1) * 3.4;
  }

  // ------------------------------------------------------------- signatures
  y += 14;

  if (y > HEIGHT - 16) {
    doc.addPage();
    y = MARGIN + 20;
  }

  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, MARGIN + 52, y);
  doc.line(RIGHT - 52, y, RIGHT, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Class Teacher", MARGIN, y + 4);
  doc.text("Principal / Coordinator", RIGHT - 52, y + 4);

  y += 11;
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Generated by the Smart School Management System. Absent papers are shown as Ab and are excluded from the GPA until the paper is sat.",
    MARGIN,
    y
  );
  doc.text(`Published ${formatDate(result.publishedAt)}`, RIGHT, y, { align: "right" });
  doc.setTextColor(15, 23, 42);

  doc.save(
    `grade-card-${result.studentId || "student"}-${String(result.term?.name || "term")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}.pdf`
  );
};
