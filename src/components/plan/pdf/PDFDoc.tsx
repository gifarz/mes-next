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
    productionName?: string;
    skuCode?: string;
    productPart?: string;
    actualQuantity?: string;
    assyGroup?: string;
    partRequst?: string;
    noMode?: string;
    totalLength?: string;
    strippingFront?: string;
    strippingRear?: string;
    halfStripFront?: string;
    halfStripEnd?: string;
    insulationFront?: string;
    insulationBack?: string;
    coreDiameter?: string;
    bladeMoveBack?: string;
    depthOfBlade?: string;
    lengthOfMb?: string;
    orderDuration: string;
    deliveryDate: string;
    cost: string;
}

type DetailPDFProps = {
    order: DetailPDF;
};

// Component
const OrderDetailPDF = ({ order }: DetailPDFProps) => {
    const fields = [
        { label: "Order Number", value: order.orderNumber || "-" },
        { label: "Customer Name", value: order.customerName || "-" },
        { label: "Production Name", value: order.productionName || "-" },
        { label: "SKU Code", value: order.skuCode || "-" },
        { label: "Product Part", value: order.productPart || "-" },
        { label: "Actual Quantity", value: order.actualQuantity || "-" },
        { label: "Assy Group", value: order.assyGroup || "-" },
        { label: "Part Request", value: order.partRequst || "-" },
        { label: "No Mode", value: order.noMode || "-" },
        { label: "Total Length", value: order.totalLength || "-" },
        { label: "Stripping Front", value: order.strippingFront || "-" },
        { label: "Stripping Rear", value: order.strippingRear || "-" },
        { label: "Half Strip Front", value: order.halfStripFront || "-" },
        { label: "Half Strip End", value: order.halfStripEnd || "-" },
        { label: "Insulation Front", value: order.insulationFront || "-" },
        { label: "Insulation Back", value: order.insulationBack || "-" },
        { label: "Core Diameter", value: order.coreDiameter || "-" },
        { label: "Blade Move Back", value: order.bladeMoveBack || "-" },
        { label: "Depth Of Blade", value: order.depthOfBlade || "-" },
        { label: "Length Of MB", value: order.lengthOfMb || "-" },
        { label: "Order Duration", value: order.orderDuration || "-" },
        { label: "Delivery Date", value: order.deliveryDate || "-" },
        { label: "Cost", value: order.cost || "-" },
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
