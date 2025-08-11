import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Styles
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: 50,
        fontSize: 12,
        fontFamily: 'Helvetica',
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 50,
        marginBottom: 30,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottom: '1px solid #444',
        paddingVertical: 15,
    },
    label: {
        color: '#bbb',
    },
    value: {
        color: '#fff',
    },
});

// Data
interface DetailPDF {
    orderNumber: string,
    customerName: string,
    productionName: string,
    skuCode: string,
    productPart: string,
    actualQuantity: string,
    orderDuration: string,
    deliveryDate: string,
    cost: string
}

type DetailPDFProps = {
    order: DetailPDF
}

// Component
const OrderDetailPDF = ({ order }: DetailPDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Detail Order</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Order Number</Text>
                <Text style={styles.value}>{order.orderNumber}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Customer Name</Text>
                <Text style={styles.value}>{order.customerName}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Production Name</Text>
                <Text style={styles.value}>{order.productionName}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>SKU Code</Text>
                <Text style={styles.value}>{order.skuCode}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Product Part</Text>
                <Text style={styles.value}>{order.productPart}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Actual Quantity</Text>
                <Text style={styles.value}>{order.actualQuantity}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Order Duration</Text>
                <Text style={styles.value}>{order.orderDuration || '-'}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Delivery Date</Text>
                <Text style={styles.value}>{order.deliveryDate || '-'}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Cost</Text>
                <Text style={styles.value}>{order.cost || '-'}</Text>
            </View>
        </Page>
    </Document>
);

export default OrderDetailPDF;
