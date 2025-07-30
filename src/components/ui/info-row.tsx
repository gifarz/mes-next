export function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-4 text-sm md:text-base">
            <span className="font-medium">{label}</span>
            <span>{value}</span>
        </div>
    );
}