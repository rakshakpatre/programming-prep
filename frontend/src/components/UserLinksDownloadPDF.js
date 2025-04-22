import React from "react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import DownloadingIcon from '@mui/icons-material/Downloading';
import { useNavigate} from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


// Styles
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
      color: "#000",
  },
  tableCells: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#432874",
    borderBottomWidth: 1,
    borderBottomColor: "#432874",
    color: "#fff",
},
  cellTitle: { flex: 2 },
  cellDesc: { flex: 4 },
  cellSmall: { flex: 1, textAlign: "center" },
  
  summaryBox: {
      marginTop: 25,
      padding: 12,
      borderWidth: 1.5,
      borderColor: "#432874",
      borderRadius: 5,
  },
  subtitle: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 8,
      color: "#432874",
      textAlign: "center",
  },
  text: {
      marginBottom: 6,
      fontSize: 12,
      color: "#333",
      lineHeight: 1.5,
  },
  label: {
      fontWeight: "bold",
      color: "#000",
  },
});


const MyPDFDocument = ({ data }) => {
  // Find the most viewed note for the summary
  const mostViewed = Array.isArray(data) && data.length > 0
    ? data.reduce((max, item) =>
      (item.view_count ?? 0) > (max.view_count ?? 0) ? item : max
    )
    : null;

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

        {/* Title Box */}
        <View style={styles.titleBox}>
          <Text style={styles.titleText}>Admin Notes Report</Text>
        </View>

        {/* Table */}
        {Array.isArray(data) && data.length > 0 ? (
          <>
            <View style={styles.table}>
              {/* Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCells, styles.cellTitle]}>Title</Text>
                <Text style={[styles.tableCells, styles.cellDesc]}>Description</Text>
                <Text style={[styles.tableCells, styles.cellSmall]}>Views</Text>
              </View>

              {/* Rows */}
              {data.map((item, index) => (
                <View key={index} style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.evenRow : styles.oddRow,
                ]}>
                  <Text style={[styles.tableCell, styles.cellTitle]}>
                    {String(item.linktitle || 'Untitled')}
                  </Text>
                  <Text style={[styles.tableCell, styles.cellDesc]}>
                    {String(item.linkcontent || 'Content')}
                  </Text>
                  <Text style={[styles.tableCell, styles.cellSmall]}>
                    {String(item.view_count ?? 0)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Optional Summary */}
            {mostViewed && (
              <View style={styles.summaryBox}>
                <Text style={styles.subtitle}>Conclusion - Most Viewed Note</Text>
                <Text style={styles.text}><Text style={styles.label}>Title:</Text> {mostViewed.linktitle}</Text>
                <Text style={styles.text}><Text style={styles.label}>Description:</Text> {mostViewed.linkcontent}</Text>
                <Text style={styles.text}><Text style={styles.label}>Total Views:</Text> {mostViewed.view_count}</Text>
              </View>
            )}
          </>
        ) : (
          <Text>No data available</Text>
        )}
      </Page>
    </Document>
  );
};

// PDF Download Button
const UserLinksDownloadPDF = ({ data }) => {
  const navigate = useNavigate();
  if (!Array.isArray(data) || data.length === 0) {
    return <div>Loading PDF data...</div>;
  }

  return (
    <div className="container-fluid mt-4" >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-start">
          <button className="btn btn-primary" onClick={() => navigate("/user-dashboard")}>
            <ArrowBackIcon /> Back to Dashboard
          </button>
        </div>
        <PDFDownloadLink
          document={<MyPDFDocument data={data} />}
          fileName="user_report.pdf"
        >

          {({ loading }) => (
            <button className="btn btn-primary shadow-lg rounded-3">
              <DownloadingIcon /> {loading ? "Generating PDF..." : "Download User Report"}
            </button>
          )}
        </PDFDownloadLink>
        </div>
      </div>
      );
};

      export default UserLinksDownloadPDF;
