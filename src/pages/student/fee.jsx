import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock3,
  AlertCircle,
  CalendarDays,
  Wallet,
  Download,
  Printer,
} from "lucide-react";
import { jsPDF } from "jspdf";
import api from "../../api/axios";

export default function Fee() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // =====================================================
  // DEMO FEE DATA
  // =====================================================

  const DEMO_FEES = [
    {
      id: 1,
      title: "Semester Fee",
      description: "6th Semester Tuition Fee",
      amount: 45000,
      paidAmount: 45000,
      dueDate: "2026-09-30",
      status: "Paid",
      paymentDate: "2026-09-05",
      invoice: "INV-2026-001",
    },
    {
      id: 2,
      title: "Library Fee",
      description: "Library and learning resources",
      amount: 2000,
      paidAmount: 2000,
      dueDate: "2026-09-30",
      status: "Paid",
      paymentDate: "2026-09-05",
      invoice: "INV-2026-002",
    },
    {
      id: 3,
      title: "Examination Fee",
      description: "Semester examination fee",
      amount: 1500,
      paidAmount: 0,
      dueDate: "2026-10-15",
      status: "Pending",
      paymentDate: null,
      invoice: "INV-2026-003",
    },
  ];

  // =====================================================
  // LOAD FEES
  // =====================================================

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);

      /*
        When backend is ready:

        const response = await api.get("/fees/my-fees");
        setFees(response.data);
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      setFees(DEMO_FEES);
    } catch (error) {
      console.error("Failed to load fees:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const summary = useMemo(() => {
    const total = fees.reduce(
      (sum, fee) => sum + Number(fee.amount || 0),
      0
    );

    const paid = fees.reduce(
      (sum, fee) =>
        sum + Number(fee.paidAmount || 0),
      0
    );

    const remaining = total - paid;

    return {
      total,
      paid,
      remaining,
    };
  }, [fees]);

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // DOWNLOAD PDF STATEMENT
  // =====================================================

  const downloadStatement = () => {
    if (!fees.length) {
      alert("There are no fee records to download.");
      return;
    }

    try {
      setDownloading(true);

      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();

      // -------------------------------------------------
      // HEADER
      // -------------------------------------------------

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("CHAUTARI", 20, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Smart School Management System",
        20,
        27
      );

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        "Student Fee Statement",
        pageWidth - 20,
        20,
        {
          align: "right",
        }
      );

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated: ${formatDate(new Date())}`,
        pageWidth - 20,
        27,
        {
          align: "right",
        }
      );

      // -------------------------------------------------
      // DIVIDER
      // -------------------------------------------------

      doc.line(20, 34, pageWidth - 20, 34);

      // -------------------------------------------------
      // STUDENT INFORMATION
      // -------------------------------------------------

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Student Information", 20, 46);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text("Student:", 20, 55);
      doc.text("student1", 55, 55);

      doc.text("Semester:", 20, 63);
      doc.text("6th Semester", 55, 63);

      doc.text("Statement:", 20, 71);
      doc.text("Fee Payment Statement", 55, 71);

      // -------------------------------------------------
      // SUMMARY
      // -------------------------------------------------

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Fee Summary", 20, 86);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(
        `Total Fee: ${formatCurrency(summary.total)}`,
        20,
        96
      );

      doc.text(
        `Paid Amount: ${formatCurrency(summary.paid)}`,
        75,
        96
      );

      doc.text(
        `Remaining: ${formatCurrency(summary.remaining)}`,
        140,
        96
      );

      // -------------------------------------------------
      // TABLE HEADER
      // -------------------------------------------------

      let y = 112;

      doc.setFillColor(241, 245, 249);
      doc.rect(
        20,
        y - 7,
        pageWidth - 40,
        10,
        "F"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);

      doc.text("Fee", 22, y);
      doc.text("Invoice", 75, y);
      doc.text("Amount", 112, y);
      doc.text("Paid", 140, y);
      doc.text("Status", 165, y);

      // -------------------------------------------------
      // TABLE ROWS
      // -------------------------------------------------

      doc.setFont("helvetica", "normal");

      fees.forEach((fee) => {
        y += 12;

        // New page if necessary
        if (y > 270) {
          doc.addPage();
          y = 25;

          doc.setFont("helvetica", "bold");
          doc.text("Fee Records - Continued", 20, y);

          y += 12;

          doc.setFont("helvetica", "bold");
          doc.text("Fee", 22, y);
          doc.text("Invoice", 75, y);
          doc.text("Amount", 112, y);
          doc.text("Paid", 140, y);
          doc.text("Status", 165, y);

          y += 5;
          doc.setFont("helvetica", "normal");
        }

        const remaining =
          Number(fee.amount || 0) -
          Number(fee.paidAmount || 0);

        doc.text(
          String(fee.title).substring(0, 24),
          22,
          y
        );

        doc.text(
          String(fee.invoice || "-"),
          75,
          y
        );

        doc.text(
          formatCurrency(fee.amount),
          112,
          y
        );

        doc.text(
          formatCurrency(fee.paidAmount),
          140,
          y
        );

        doc.text(
          fee.status || "Pending",
          165,
          y
        );

        y += 7;

        doc.setFontSize(8);

        doc.text(
          `Due: ${formatDate(
            fee.dueDate
          )} | Remaining: ${formatCurrency(
            remaining
          )}`,
          22,
          y
        );

        doc.setFontSize(9);

        if (fee.paymentDate) {
          y += 5;

          doc.setFontSize(8);

          doc.text(
            `Payment Date: ${formatDate(
              fee.paymentDate
            )}`,
            22,
            y
          );

          doc.setFontSize(9);
        }

        doc.line(
          20,
          y + 4,
          pageWidth - 20,
          y + 4
        );
      });

      // -------------------------------------------------
      // FOOTER
      // -------------------------------------------------

      const pageCount =
        doc.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        const footerY =
          doc.internal.pageSize.getHeight() - 15;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        doc.text(
          "This is a computer-generated fee statement.",
          20,
          footerY
        );

        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 20,
          footerY,
          {
            align: "right",
          }
        );
      }

      // -------------------------------------------------
      // SAVE
      // -------------------------------------------------

      doc.save(
        `student-fee-statement-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );
    } catch (error) {
      console.error(
        "Failed to generate PDF:",
        error
      );

      alert(
        "Unable to generate the PDF statement."
      );
    } finally {
      setDownloading(false);
    }
  };

  // =====================================================
  // PRINT STATEMENT
  // =====================================================

  const printStatement = () => {
    if (!fees.length) {
      alert("There are no fee records to print.");
      return;
    }

    const rows = fees
      .map((fee) => {
        const remaining =
          Number(fee.amount || 0) -
          Number(fee.paidAmount || 0);

        return `
          <tr>
            <td>
              <strong>${fee.title}</strong>
              <br />
              <small>${fee.description || ""}</small>
            </td>
            <td>${fee.invoice || "-"}</td>
            <td>${formatCurrency(fee.amount)}</td>
            <td>${formatCurrency(fee.paidAmount)}</td>
            <td>${formatCurrency(remaining)}</td>
            <td>${fee.status || "Pending"}</td>
            <td>${formatDate(fee.dueDate)}</td>
          </tr>
        `;
      })
      .join("");

    const printWindow = window.open(
      "",
      "_blank",
      "width=1000,height=800"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print the statement."
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Fee Statement</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #0f172a;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }

            .school {
              font-size: 22px;
              font-weight: bold;
            }

            .subtitle {
              color: #64748b;
              font-size: 12px;
              margin-top: 5px;
            }

            .statement-title {
              font-size: 20px;
              font-weight: bold;
              text-align: right;
            }

            .date {
              color: #64748b;
              font-size: 12px;
              margin-top: 5px;
              text-align: right;
            }

            .student-info {
              margin-bottom: 25px;
            }

            .student-info h2,
            .summary h2 {
              font-size: 15px;
              margin-bottom: 10px;
            }

            .info-grid {
              display: grid;
              grid-template-columns: 150px 1fr;
              gap: 7px;
              font-size: 13px;
            }

            .summary {
              margin-bottom: 25px;
            }

            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }

            .summary-box {
              border: 1px solid #e2e8f0;
              padding: 15px;
              border-radius: 8px;
            }

            .summary-label {
              font-size: 11px;
              color: #64748b;
            }

            .summary-value {
              font-size: 17px;
              font-weight: bold;
              margin-top: 5px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }

            th,
            td {
              border: 1px solid #cbd5e1;
              padding: 9px;
              text-align: left;
              font-size: 11px;
            }

            th {
              background: #f1f5f9;
              font-weight: bold;
            }

            small {
              color: #64748b;
            }

            .footer {
              margin-top: 35px;
              padding-top: 12px;
              border-top: 1px solid #cbd5e1;
              color: #64748b;
              font-size: 10px;
            }

            @media print {
              body {
                margin: 20px;
              }

              .no-print {
                display: none;
              }
            }
          </style>
        </head>

        <body>

          <div class="header">
            <div>
              <div class="school">
                CHAUTARI
              </div>

              <div class="subtitle">
                Smart School Management System
              </div>
            </div>

            <div>
              <div class="statement-title">
                Student Fee Statement
              </div>

              <div class="date">
                Generated: ${formatDate(new Date())}
              </div>
            </div>
          </div>

          <div class="student-info">
            <h2>Student Information</h2>

            <div class="info-grid">
              <strong>Student:</strong>
              <span>student1</span>

              <strong>Semester:</strong>
              <span>6th Semester</span>

              <strong>Statement:</strong>
              <span>Fee Payment Statement</span>
            </div>
          </div>

          <div class="summary">
            <h2>Fee Summary</h2>

            <div class="summary-grid">

              <div class="summary-box">
                <div class="summary-label">
                  Total Fee
                </div>

                <div class="summary-value">
                  ${formatCurrency(summary.total)}
                </div>
              </div>

              <div class="summary-box">
                <div class="summary-label">
                  Paid Amount
                </div>

                <div class="summary-value">
                  ${formatCurrency(summary.paid)}
                </div>
              </div>

              <div class="summary-box">
                <div class="summary-label">
                  Remaining
                </div>

                <div class="summary-value">
                  ${formatCurrency(summary.remaining)}
                </div>
              </div>

            </div>
          </div>

          <h2 style="font-size:15px;">
            Fee Records
          </h2>

          <table>
            <thead>
              <tr>
                <th>Fee</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            This is a computer-generated fee statement.
            Students cannot modify fee records.
          </div>

          <script>
            window.onload = function () {
              window.print();

              window.onafterprint = function () {
                window.close();
              };
            };
          </script>

        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading fee information...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">
            Student Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Fee Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View your fee details and payment history.
          </p>
        </div>

        {/* Statement Buttons */}
        {fees.length > 0 && (
          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={printStatement}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" />
              Print Statement
            </button>

            <button
              type="button"
              onClick={downloadStatement}
              disabled={downloading}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />

              {downloading
                ? "Generating..."
                : "Download PDF"}
            </button>

          </div>
        )}
      </section>

      {/* =================================================
          NOTICE
      ================================================= */}

      <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

        <div>
          <p className="font-semibold text-blue-900">
            Fee information
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-700">
            Fee amounts and payment status are managed
            by the school administration.
          </p>
        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {/* Total */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Fee
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(summary.total)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <Wallet className="h-5 w-5 text-slate-700" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Total amount assigned by administration
          </p>
        </div>

        {/* Paid */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Paid
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {formatCurrency(summary.paid)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Amount already paid
          </p>
        </div>

        {/* Remaining */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Remaining
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${
                  summary.remaining > 0
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {formatCurrency(summary.remaining)}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
              <Clock3 className="h-5 w-5 text-amber-600" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Amount remaining to be paid
          </p>
        </div>

      </section>

      {/* =================================================
          FEE RECORDS
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Fee Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Fee records updated by administration.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Receipt className="h-4 w-4" />
            {fees.length} records
          </div>

        </div>

        {fees.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-slate-300" />

            <h3 className="mt-4 font-semibold text-slate-800">
              No fee records
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              The administration has not added any fee
              records yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {fees.map((fee) => {
              const remaining =
                Number(fee.amount || 0) -
                Number(fee.paidAmount || 0);

              return (
                <div
                  key={fee.id || fee._id}
                  className="p-5 transition hover:bg-slate-50"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* Fee Information */}
                    <div className="flex gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <Receipt className="h-5 w-5 text-slate-600" />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {fee.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {fee.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">

                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />

                            Due:
                            {" "}
                            {formatDate(fee.dueDate)}
                          </span>

                          <span>
                            Invoice: {fee.invoice}
                          </span>

                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex flex-wrap items-center gap-6 lg:justify-end">

                      <div>
                        <p className="text-xs text-slate-400">
                          Amount
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {formatCurrency(fee.amount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Paid
                        </p>

                        <p className="mt-1 font-bold text-emerald-600">
                          {formatCurrency(fee.paidAmount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Remaining
                        </p>

                        <p className="mt-1 font-bold text-amber-600">
                          {formatCurrency(remaining)}
                        </p>
                      </div>

                      {/* Status */}
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          fee.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {fee.status === "Paid" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Clock3 className="h-3.5 w-3.5" />
                        )}

                        {fee.status}
                      </span>

                    </div>
                  </div>

                  {/* Payment Information */}
                  {fee.paymentDate && (
                    <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                      Payment recorded on{" "}
                      <strong className="text-slate-700">
                        {formatDate(fee.paymentDate)}
                      </strong>
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* =================================================
          HELP
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">

        <div className="flex gap-3">

          <AlertCircle className="h-5 w-5 shrink-0 text-slate-400" />

          <div>

            <h3 className="font-semibold text-slate-800">
              Need help with your fee?
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              If you believe your fee information is
              incorrect, please contact the school
              administration. Students cannot modify
              fee records.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}