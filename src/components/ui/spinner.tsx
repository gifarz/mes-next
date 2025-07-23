type SpinnerProps = {
    size?: number;
};

export const Spinner = ({ size = 16 }: SpinnerProps) => (
    <div
        className="animate-spin rounded-full border-2 border-background border-t-transparent"
        style={{ width: size, height: size }}
    />
);