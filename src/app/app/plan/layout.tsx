import '@/styles/gantt.css';
import 'gantt-task-react/dist/index.css';

export default function PlanLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            {children}
        </div>
    );
}