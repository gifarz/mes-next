type SpinnerProps = {
    size?: number;
    className?: string;
};

export const Spinner = ({ size = 16, className = "border-black" }: SpinnerProps) => (
    <div
        className={`animate-spin rounded-full border-2 border-t-transparent ${className}`}
        style={{ width: size, height: size }}
    />
);