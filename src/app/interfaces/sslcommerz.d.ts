declare module "sslcommerz-lts" {
    interface SSLCommerzPaymentData {
        total_amount: number;
        currency: string;
        tran_id: string;
        success_url: string;
        fail_url: string;
        cancel_url: string;
        ipn_url?: string;
        shipping_method?: string;
        product_name: string;
        product_category?: string;
        product_profile?: string;
        cus_name: string;
        cus_email: string;
        cus_add1?: string;
        cus_city?: string;
        cus_state?: string;
        cus_postcode?: string;
        cus_country?: string;
        cus_phone?: string;
        ship_name?: string;
        ship_add1?: string;
        ship_city?: string;
        ship_state?: string;
        ship_postcode?: number;
        ship_country?: string;
        value_a?: string;
        value_b?: string;
        value_c?: string;
        value_d?: string;
    }

    interface SSLCommerzInitResponse {
        status: string;
        faession?: string;
        sessionkey?: string;
        GatewayPageURL?: string;
        redirectGatewayURL?: string;
        directPaymentURL?: string;
        desc?: string;
    }

    class SSLCommerzPayment {
        constructor(store_id: string, store_passwd: string, is_live: boolean);
        init(data: SSLCommerzPaymentData): Promise<SSLCommerzInitResponse>;
        validate(data: { val_id: string }): Promise<unknown>;
        transactionQueryByTransactionId(data: { tran_id: string }): Promise<unknown>;
        transactionQueryBySessionId(data: { sessionkey: string }): Promise<unknown>;
        initiateRefund(data: {
            refund_amount: number;
            refund_remarks: string;
            bank_tran_id: string;
            refe_id: string;
        }): Promise<unknown>;
        refundQuery(data: { refund_ref_id: string }): Promise<unknown>;
    }

    export = SSLCommerzPayment;
}
