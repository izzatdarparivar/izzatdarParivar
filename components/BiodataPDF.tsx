"use client";


import { Document, Page, Text, View, StyleSheet, Image, pdf, Font } from "@react-pdf/renderer";
import { BiodataInput, formatBiodataForPDF } from "@/lib/biodata-pdf";


// Font.register({
//   family: "NotoSansDevanagari",
//   src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf",
// });


const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#FFFDF7" },
  header: { textAlign: "center", marginBottom: 20, borderBottom: "2pt solid #800000", paddingBottom: 15 },
  title: { fontSize: 24, color: "#800000", fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 10, color: "#666", marginTop: 5 },
  photo: { width: 100, height: 100, borderRadius: 50, alignSelf: "center", marginBottom: 10 },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#800000", marginBottom: 8, borderBottom: "1pt solid #f97316", paddingBottom: 3 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { fontSize: 10, color: "#666", width: "35%" },
  value: { fontSize: 10, color: "#333", width: "65%" },
  bio: { fontSize: 10, color: "#444", lineHeight: 1.5, marginTop: 5, fontStyle: "italic" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#999", borderTop: "1pt solid #eee", paddingTop: 10 },
  ornament: { textAlign: "center", fontSize: 14, color: "#f97316", marginBottom: 5 },
});


interface BiodataPDFProps {
  data: BiodataInput;
}


export function BiodataPDFDocument({ data }: BiodataPDFProps) {
  const formatted = formatBiodataForPDF(data);


  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.ornament}>✦ Auspicious Beginnings ✦</Text>
          <Text style={styles.title}>BIODATA</Text>
          <Text style={styles.subtitle}>Izzatdar Parivar Matrimonial</Text>
        </View>


        {formatted.photo && <Image src={formatted.photo} style={styles.photo} />}


        {formatted.sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.fields.map((field, fIdx) => (
              <View key={fIdx} style={styles.row}>
                <Text style={styles.label}>{field.label}:</Text>
                <Text style={styles.value}>{field.value}</Text>
              </View>
            ))}
          </View>
        ))}


        {formatted.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{formatted.bio}</Text>
          </View>
        )}


        <Text style={styles.footer}>
          Generated via Izzatdar Parivar | izzatdarparivar.com
        </Text>
      </Page>
    </Document>
  );
}


export async function generateBiodataPDF(data: BiodataInput): Promise<Blob> {
  try {
    const blob = await pdf(<BiodataPDFDocument data={data} />).toBlob();
    return blob;
  } catch (error) {
    console.warn("Initial PDF generation failed, trying without image:", error);
    // If it failed, it might be the image or font. Try without image first.
    const dataWithoutPhoto = { ...data, photoUrl: undefined };
    return await pdf(<BiodataPDFDocument data={dataWithoutPhoto} />).toBlob();
  }
}


export function downloadBiodataPDF(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}_biodata.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}



