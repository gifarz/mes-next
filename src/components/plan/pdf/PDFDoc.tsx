import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
    page: {
        backgroundColor: "#1a1a1a",
        color: "#fff",
        padding: 50,
        fontSize: 12,
        fontFamily: "Helvetica",
    },
    title: {
        fontSize: 20,
        textAlign: "center",
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 50,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottom: "1px solid #444",
        paddingVertical: 15,
    },
    label: {
        color: "#bbb",
    },
    value: {
        color: "#fff",
    },
});

// Data
interface DetailPDF {
    orderNumber?: string;
    customerName?: string;
    productName?: string;
    productCode?: string;
    productPart?: string;
    actualQuantity?: string;
    totalLength?: string;
    strippingFront?: string;
    strippingRear?: string;
    strippingHalfFront?: string;
    strippingHalfRear?: string;
    diameterCore?: string;
    settingPieces?: string;
    currentPieces?: string;
    deliveryDate: string;
}

type DetailPDFProps = {
    order: DetailPDF;
};

// Component
const OrderDetailPDF = ({ order }: DetailPDFProps) => {
    const fields = [
        { label: "Order Number", value: order.orderNumber || "-" },
        { label: "Customer Name", value: order.customerName || "-" },
        { label: "Product Name", value: order.productName || "-" },
        { label: "Product Code", value: order.productCode || "-" },
        { label: "Product Part", value: order.productPart || "-" },
        { label: "Actual Quantity", value: order.actualQuantity || "-" },
        { label: "Total Length", value: order.totalLength || "-" },
        { label: "Stripping Front", value: order.strippingFront || "-" },
        { label: "Stripping Rear", value: order.strippingRear || "-" },
        { label: "Stripping Half Front", value: order.strippingHalfFront || "-" },
        { label: "Stripping Half Rear", value: order.strippingHalfRear || "-" },
        { label: "Diameter Core", value: order.diameterCore || "-" },
        { label: "Setting Pieces", value: order.settingPieces || "-" },
        { label: "Current Pieces", value: order.currentPieces || "-" },
        { label: "Delivery Date", value: order.deliveryDate || "-" },
    ];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>Order Detail Infomation</Text>

                {fields.map(({ label, value }, index) => (
                    <View key={index} style={styles.row}>
                        <Text style={styles.label}>{label}</Text>
                        <Text style={styles.value}>{value}</Text>
                    </View>
                ))}
            </Page>
        </Document>
    );
};

export default OrderDetailPDF;
