export const NyikaFormInput = (
    { props, Icon, className, onChange }: {
        Icon?: any;
        className?: string;
        props: React.InputHTMLAttributes<HTMLInputElement>;
        value: string;
        onChange: (e: string) => void;
    }
) => {
    return (
        <div className={`
        ${className}
        relative group`}>
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Icon className='h-5 w-5 text-foreground-400 group-focus-within:text-primary transition-colors' />
                </div>
            )}
            <input
                {...props}
                value={props.value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-content2 border border-divider rounded-2xl text-foreground placeholder:text-foreground-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base"
            />
        </div>
    )
}