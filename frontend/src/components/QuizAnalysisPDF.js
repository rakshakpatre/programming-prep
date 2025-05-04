import React, { useEffect, useState } from 'react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import DownloadingIcon from '@mui/icons-material/Downloading';
import LoadingIcon from '@mui/icons-material/Cached';
import { saveAs } from 'file-saver';
import { useLocation } from "react-router-dom";

export default function QuizAnalysisPDF({ quizId, isPublished }) {
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    const fetchAndDownload = async () => {
        setLoading(true);

        try {
            const res = await fetch(`http://localhost:5000/get-quiz-analysis/${quizId}`);
            const data = await res.json();

            const quiz = data.quiz;
            const results = data.results;



            const getAnalysis = () => {
                const passCount = results.filter(u => u.percentage >= 35).length;
                const percent = results.length ? (passCount / results.length) * 100 : 0;
                if (percent >= 35) return "Solvable";
                if (percent >= 20) return "Hard";
                return "Unsolvable";
            };

            const styles = StyleSheet.create({
                page: { padding: 20, backgroundColor: "#f5f5f5" },
                section: { marginBottom: 10, padding: 10, borderWidth: 1, borderColor: "#432874", borderRadius: 5 },
                titleBox: { backgroundColor: "#432874", padding: 10, borderRadius: 5, marginBottom: 10 },
                titleText: { fontSize: 16, color: "#ffffff", textAlign: "center", fontWeight: "bold" },
                subtitle: { fontSize: 12, fontWeight: "bold", marginBottom: 5, color: "#333" },
                text: { fontSize: 12, color: "#555", fontWeight: "bold" },
                correct: { color: "green", fontWeight: "bold" },
                wrong: { color: "red", fontWeight: "bold" },
                table: { display: "table", width: "100%", marginTop: 10, borderWidth: 1, borderColor: "#432874" },
                tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#432874" },
                tableHeader: { backgroundColor: "#432874", color: "white", fontWeight: "bold", padding: 5, fontSize: 10 },
                tableCell: { padding: 5, fontSize: 12, borderRightWidth: 1, borderRightColor: "#432874" },
                questionCell: { flex: 3 },
                smallCell: { flex: 1 },
                dateCell: { flex: 1 },
                marginBottom: { marginBottom: "5px" },
            });


            const PDFReport = (
                <Document>
                    <Page size="A4" style={styles.page}>
                        <Text style={{
                            position: "absolute",
                            top: "35%", left: "5%", fontSize: 70, color: "#432874",
                            opacity: 0.3, transform: "rotate(-45deg)", textAlign: "center",
                            width: "100%", fontFamily: "Times-Roman", zIndex: -1
                        }}>
                            Programming.Prep
                        </Text>
                        <View style={styles.titleBox}>
                            <Text style={styles.titleText}>Quiz Analysis Report</Text>
                        </View>

                        <View style={styles.section}>
                            <Text><Text style={styles.subtitle}>Quiz Name:</Text> <Text style={styles.text}>{quiz.QuizName}</Text></Text>
                            <Text><Text style={styles.subtitle}>Description:</Text> <Text style={styles.text}>{quiz.QuizDescription}</Text></Text>
                            <Text><Text style={styles.subtitle}>Number of Questions:</Text> <Text style={styles.text}>{quiz.NumberOfQue}</Text></Text>
                            <Text><Text style={styles.subtitle}>Total Users Attempted:</Text> <Text style={styles.text}>{results.length}</Text></Text>
                        </View>

                        <View style={styles.table}>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader]}>Name</Text>
                                <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader]}>Percentage</Text>
                                <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader]}>Status</Text>
                            </View>
                            {results.map((r, idx) => (
                                <View style={styles.tableRow} key={idx}>
                                    <Text style={[styles.tableCell, styles.smallCell]}>{r.name}</Text>
                                    <Text style={[styles.tableCell, styles.smallCell]}>{r.percentage}%</Text>
                                    <Text style={[styles.tableCell, styles.smallCell, r.percentage >= 35 ? styles.correct : styles.wrong]}>
                                        {r.status}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.section}>
                            <Text>
                                <Text style={styles.subtitle}>Quiz Analysis:</Text>
                                <Text style={styles.text}> This quiz is considered </Text>
                                <Text style={styles.text}>{getAnalysis()}</Text>
                                <Text style={styles.text}> based on users’ performance.</Text>
                            </Text>
                        </View>
                    </Page>
                </Document>
            );


            const blob = await pdf(PDFReport).toBlob();
            saveAs(blob, `${quiz.QuizName}-Report.pdf`);

        } catch (err) {
            console.error("PDF generation error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {
                isPublished ? (
                    location.pathname === "/admin-quiz-list" ?
                        (
                            <button onClick={fetchAndDownload} className="btn btn-primary rounded-pill mb-1"
                                style={{ boxShadow: "gray 1px 1px 8px 1px" }} disabled={loading}>
                                <DownloadingIcon /> {loading ? 'Generating PDF...' : 'Download Quiz Analysis'}
                            </button>
                        ) : (
                            <button className="btn btn-primary rounded-pill mx-1 btn-sm"
                                style={{ boxShadow: "gray 1px 1px 8px 1px" }} onClick={fetchAndDownload} disabled={loading}>
                                {loading ? <LoadingIcon color="" /> : <DownloadingIcon />}
                            </button>
                        )
                ) : ("")
            }
        </>
    );
}
