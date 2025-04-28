import React from "react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import DownloadingIcon from '@mui/icons-material/Downloading';
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: "#fdfdfd",
        fontSize: 12,
        fontFamily: "Times-Roman",
    },
    watermark: {
        position: "absolute",
        fontSize: 50,
        color: "#432874",
        opacity: 0.1,
        transform: "rotate(-45deg)",
        left: "10%",
        top: "40%",
        zIndex: 0,
    },
    titleBox: {
        backgroundColor: "#432874",
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    titleText: {
        fontSize: 18,
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
    },
    table: {
        display: "table",
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#432874",
    },
    tableRow: {
        flexDirection: "row",
    },
    tableHeader: {
        backgroundColor: "#432874",
    },
    tableCell: {
        padding: 6,
        borderRightWidth: 1,
        borderRightColor: "#432874",
        borderBottomWidth: 1,
        borderBottomColor: "#432874",
    },
    cellTitle: {
        flex: 3,
        color: "#000",
    },
    cellTitles: {
        flex: 3,
        color: "#fff",
    },
    cellSmall: {
        flex: 1,
        color: "#000",
        textAlign: "center",
    },
    cellSmalls: {
        flex: 1,
        color: "#fff",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 6,
        color: "#333",
    },
    text: {
        marginBottom: 4,
        fontSize: 12,
        color: "#333",
    },
    highlight: {
        fontWeight: "bold",
        color: "#432874",
    },
    summaryBox: {
        marginTop: 25,
        padding: 12,
        borderWidth: 1.5,
        borderColor: "#432874",
        borderRadius: 5,
        // backgroundColor: "#f2f0fa",
    },

    section: {
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: "#432874",
        borderRadius: 5
    },
});


const MyPDFDocument = ({user, data }) => {
    let mostViewed = null;
    let mostDownloaded = null;

    if (Array.isArray(data) && data.length > 0) {
        mostViewed = data.reduce((max, item) => {
            const totalViews = (item.view_count ?? 0) + (item.other_user_view_count ?? 0);
            return totalViews > ((max.view_count ?? 0) + (max.other_user_view_count ?? 0)) ? item : max;
        });

        mostDownloaded = data.reduce((max, item) => {
            const totalDownloads = (item.download_count ?? 0) + (item.other_user_download_count ?? 0);
            return totalDownloads > ((max.download_count ?? 0) + (max.other_user_download_count ?? 0)) ? item : max;
        });
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Watermark */}
                <Text style={{
                    position: "absolute",
                    top: "35%", left: "5%", fontSize: 70, color: "#432874",
                    opacity: 0.3, transform: "rotate(-45deg)", textAlign: "center",
                    width: "100%", fontFamily: "Times-Roman", zIndex: -1
                }}>
                    Programming.Prep
                </Text>

                {/* Title */}
                <View style={styles.titleBox}>
                    <Text style={styles.titleText}>User Notes Report</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>User Information:</Text>
                    <Text style={styles.text}>Name: {user?.fullName}</Text>
                    <Text style={styles.text}>Email: {user?.primaryEmailAddress?.emailAddress}</Text>
                    <Text style={styles.text}>User ID: {user?.id}</Text>
                </View>

                {/* Table */}
                {Array.isArray(data) && data.length > 0 ? (
                    <>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.tableCell, styles.cellTitles]}>Title</Text>
                                <Text style={[styles.tableCell, styles.cellSmalls]}>Downloads</Text>
                                <Text style={[styles.tableCell, styles.cellSmalls]}>Views</Text>
                            </View>

                            {data.map((item, index) => (
                                <View key={index} style={[
                                    styles.tableRow,
                                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                                ]}>
                                    <Text style={[styles.tableCell, styles.cellTitle]}>{String(item.title || 'Untitled')}</Text>
                                    <Text style={[styles.tableCell, styles.cellSmall]}>
                                        {(item.download_count ?? 0) + (item.other_user_download_count ?? 0)}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.cellSmall]}>
                                        {(item.view_count ?? 0) + (item.other_user_view_count ?? 0)}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Summary */}
                        <View style={[styles.summaryBox, { marginTop: 20 }]}>
                            <Text style={styles.subtitle}>Conclusion:</Text>
                            {mostViewed && (
                                <Text style={styles.text}>
                                    Most Viewed Note: <Text style={styles.highlight}>{mostViewed.title}</Text> — Total Views: {(mostViewed.view_count ?? 0) + (mostViewed.other_user_view_count ?? 0)}
                                </Text>
                            )}
                            {mostDownloaded && (
                                <Text style={styles.text}>
                                    Most Downloaded Note: <Text style={styles.highlight}>{mostDownloaded.title}</Text> — Total Downloads: {(mostDownloaded.download_count ?? 0) + (mostDownloaded.other_user_download_count ?? 0)}
                                </Text>
                            )}
                        </View>
                    </>
                ) : (
                    <Text>No data available</Text>
                )}
            </Page>
        </Document>
    );
};



// PDF Download Button
const UserNotesDownloadPDF = ({ data }) => {
    const { user } = useUser();
    const navigate = useNavigate();

    if (!Array.isArray(data) || data.length === 0) {
        return <div>Loading PDF data...</div>;
    }

    return (
        <>
            <div className="container-fluid mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="text-start">
                        <button className="btn btn-primary rounded-pill" style={{ boxShadow: "gray 1px 1px 8px 1px" }} onClick={() => navigate("/user-dashboard")}>
                            <ArrowBackIcon /> Back to Dashboard
                        </button>
                    </div>
                    <PDFDownloadLink
                        document={<MyPDFDocument user={user} data={data} />}
                        fileName="user_report.pdf"
                    >

                        {({ loading }) => (
                            <button className="btn btn-primary rounded-pill text-end" style={{ boxShadow: "gray 1px 1px 8px 1px" }}>
                                <DownloadingIcon /> {loading ? "Generating PDF..." : "Download User Report"}
                            </button>
                        )}
                    </PDFDownloadLink>
                </div>
            </div>
        </>
    );
};



export default UserNotesDownloadPDF;

