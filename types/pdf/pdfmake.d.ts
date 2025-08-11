// types/pdfmake-custom.d.ts
declare module "pdfmake/build/pdfmake" {
    import type { TDocumentDefinitions } from "pdfmake/interfaces";

    interface CustomPdfMake {
        vfs: Record<string, string>;
        createPdf: (docDefinition: TDocumentDefinitions) => {
            download: (fileName?: string) => void;
            open: () => void;
            getBlob: (callback: (blob: Blob) => void) => void;
        };
    }

    const pdfMake: CustomPdfMake;
    export = pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
    export const pdfMake: {
        vfs: Record<string, string>;
    };
}