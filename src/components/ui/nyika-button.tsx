import { ArrowRight, Loader2 } from "lucide-react";

export const NyikaButton = (
    { props, Icon, className, onClick, isLoading }: {
        Icon?: any;
        className?: string;
        props: React.ButtonHTMLAttributes<HTMLButtonElement>;
        onClick?: () => void;
        isLoading: boolean;
    }
) => {
    return (
        <button
            type="submit"
            disabled={isLoading}
            className={`${className} w-full flex items-center justify-center gap-2 h-14 bg-primary hover:opacity-90 disabled:bg-content3 disabled:opacity-50 text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/10 transition-all duration-200 group overflow-hidden relative`}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    <span className="relative z-10">{props.children}</span>
                    {Icon && <Icon className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />}
                </>
            )}
        </button>
    )
}   