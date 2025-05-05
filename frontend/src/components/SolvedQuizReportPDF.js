import React, { useEffect, useState } from "react";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { useUser } from "@clerk/clerk-react";
import DownloadingIcon from '@mui/icons-material/Downloading';

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

const Report = ({ user, data }) => {
    if (!data || data.length === 0) {
        return (
            <Document>
                <Page style={styles.page}>
                    <Text>No quiz data available.</Text>
                </Page>
            </Document>
        );
    }

    const avg = data.reduce((sum, q) => sum + parseFloat(q.Percentage || 0), 0) / data.length;

    const getAnalysis = () => {
        if (avg >= 80) return "Excellent performance!";
        if (avg >= 60) return "Good performance.";
        return "Needs improvement.";
    };

    return (
        <Document>
            <Page style={styles.page}>
                <Text style={{
                    position: "absolute",
                    top: "35%", left: "5%", fontSize: 70, color: "#432874",
                    opacity: 0.3, transform: "rotate(-45deg)", textAlign: "center",
                    width: "100%", fontFamily: "Times-Roman", zIndex: -1
                }}>
                    Programming.Prep
                </Text>

                <View style={styles.titleBox}>
                    <Text style={styles.titleText}>Solved Quiz Report</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>User Information:</Text>
                    <Text style={styles.text}>Name: {user?.fullName}</Text>
                    <Text style={styles.text}>Email: {user?.primaryEmailAddress?.emailAddress}</Text>
                    <Text style={styles.text}>User ID: {user?.id}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>Quiz Results:</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, { backgroundColor: "#432874" }]}>
                            <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader, styles.dateCell]}>Solved Date</Text>
                            <Text style={[styles.tableCell, styles.questionCell, styles.tableHeader]}>Quiz Name</Text>
                            <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader]}>Result</Text>
                            <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader]}>Marks</Text>
                            <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader]}>Percentage %</Text>
                        </View>

                        {data.map((quiz, idx) => (
                            <View key={idx} style={[
                                styles.tableRow,
                                quiz.Status === "Fail" && { backgroundColor: "#ffe6e6" } // light red background
                            ]}>
                                <Text style={[styles.tableCell, styles.smallCell]}>
                                    {new Date(quiz.AttemptDate).toLocaleDateString()}
                                </Text>
                                <Text style={[styles.tableCell, styles.questionCell]}>{quiz.QuizName}</Text>
                                <Text style={[
                                    styles.tableCell, styles.smallCell,
                                    quiz.Status === "Pass" ? styles.correct : styles.wrong
                                ]}>{quiz.Status}</Text>
                                <Text style={[styles.tableCell, styles.smallCell]}>
                                    {quiz.ObtainedMarks}/{quiz.TotalMarks}
                                </Text>
                                <Text style={[styles.tableCell, styles.smallCell]}>
                                    {quiz.Percentage}%
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>Performance Analysis:</Text>
                    <Text style={styles.text}>{getAnalysis()}</Text>
                    <Text style={[styles.text, styles.marginBottom]}>Average Score: {avg.toFixed(2)}%</Text>
                    <Text style={[styles.subtitle, styles.marginBottom]}>Performance Chart:</Text>
                    <View>
                        {data.map((quiz, index) => (
                            <View key={index} style={{ marginBottom: 5 }}>
                                <Text style={styles.text}>{quiz.QuizName} ({quiz.Percentage}%)</Text>
                                <View style={{
                                    marginTop: "5px",
                                    height: 10,
                                    width: `${Math.min(quiz.Percentage, 100)}%`,
                                    backgroundColor: quiz.Status === "Pass" ? "#0d6efd" : "#dc3545"
                                }} />
                            </View>
                        ))}
                    </View>

                </View>

            </Page>
        </Document>
    );
};


const SolvedQuizReportPDF = () => {
    const { user } = useUser();
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const response = await fetch(`https://programming-prep.onrender.com/api/solved-quiz-report/${user.id}`);
                const data = await response.json();
                setReportData(data);
            } catch (error) {
                console.error("Failed to fetch report data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchReportData();
        }
    }, [user]);

    if (loading) return <p>Preparing report...</p>;

    return (
        <PDFDownloadLink
            document={<Report user={user} data={reportData} />}
            fileName="Solved Quiz Report.pdf"
        >
            <button className="btn btn-primary rounded-pill"
                style={{ boxShadow: "gray 1px 1px 8px 1px" }}>
                <DownloadingIcon /> Download Solved Quiz Report
            </button>
        </PDFDownloadLink>
    );
};

export default SolvedQuizReportPDF;
