import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    section: {
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: "#432874",
        borderRadius: 5,
        // backgroundColor: "#ffffff",
    },
    titleBox: {
        backgroundColor: "#432874",
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    titleText: {
        fontSize: 16,
        color: "#ffffff",
        textAlign: "center",
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    text: {
        fontSize: 12,
        color: "#555",
        fontWeight: "bold",
    },
    correct: {
        color: "green",
        fontWeight: "bold",
    },
    wrong: {
        color: "red",
        fontWeight: "bold",
    },
    table: {
        display: "table",
        width: "100%",
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#432874",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#432874",
    },
    tableHeader: {
        backgroundColor: "#432874",
        color: "white",
        fontWeight: "bold",
        padding: 5,
        fontSize: 10,
    },
    tableCell: {
        padding: 5,
        fontSize: 12,
        borderRightWidth: 1,
        borderRightColor: "#432874",
    },
    questionCell: {
        flex: 3,
    },
    smallCell: {
        flex: 1,
    },
});

const QuizResultPDF = ({ quizData, quizResult, questions, user }) => (
    <Document>
        <Page style={styles.page}>
            <Text
                style={{
                    position: "absolute",
                    top: "35%",
                    left: "5%",
                    fontSize: 70,
                    color: "#432874",
                    opacity: 0.3,
                    transform: "rotate(-45deg)",
                    textAlign: "center",
                    width: "100%",
                    fontFamily: "Times-Roman",
                    zIndex: -1,
                }}
            >
                Programming.Prep
            </Text>


            <View style={styles.titleBox}>
                <Text style={styles.titleText}>{quizData.QuizName}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>User Information:</Text>
                <Text style={styles.text}>Name: {user?.fullName}</Text>
                <Text style={styles.text}>Email: {user?.primaryEmailAddress?.emailAddress}</Text>
                <Text style={styles.text}>User ID: {user?.id}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Description:</Text>
                <Text style={styles.text}>{quizData.QuizDescription}</Text>
                <Text style={styles.subtitle}>Total Questions:</Text>
                <Text style={styles.text}>{quizData.NumberOfQue}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Quiz Result:</Text>
                <Text style={[styles.text, quizResult.Status === "Pass" ? styles.correct : styles.wrong]}>
                    {quizResult.Status} - {quizResult.Percentage}%
                </Text>
                <Text style={styles.text}>Marks: {quizResult.ObtainedMarks}/{quizResult.TotalMarks}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Quiz Responses</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, { backgroundColor: "#432874" }]}>
                        <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader]}>#</Text>
                        <Text style={[styles.tableCell, styles.questionCell, styles.tableHeader]}>Question</Text>
                        <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader]}>Your Answer</Text>
                        <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader]}>Correct Answer</Text>
                    </View>

                    {questions.map((q, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.smallCell]}>{index + 1}</Text>
                            <Text style={[styles.tableCell, styles.questionCell]}>{q.QuestionText}</Text>
                            <Text style={[styles.tableCell, styles.smallCell, q.IsCorrect ? styles.correct : styles.wrong]}>
                                {q[`Option${q.SelectedOption}`]} {q.IsCorrect ? "\u2714" : "\u2716"}
                            </Text>
                            <Text style={[styles.tableCell, styles.smallCell, styles.correct]}>
                                {q[`Option${q.CorrectOption}`]}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </Page>
    </Document>
);

export default QuizResultPDF;
