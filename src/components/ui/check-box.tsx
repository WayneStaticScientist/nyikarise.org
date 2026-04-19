export const NyikaCheckBox = (
    { props, onChange, checked, label }: {
        props: React.InputHTMLAttributes<HTMLInputElement>;
        onChange: (e: boolean) => void;
        label: string;
        checked: boolean;
    }
) => {
    return (
        <label className="flex items-center space-x-3 cursor-pointer group w-fit select-none">
            <div className="relative flex items-center">
                <input
                    {...props}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="peer h-5 w-5 appearance-none rounded-md border border-divider bg-content2 checked:bg-primary checked:border-primary transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-primary/20"
                />
                <svg
                    className="absolute h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-[3px] top-[3px]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <span className="text-sm font-medium text-foreground-500 group-hover:text-foreground transition-colors">
                {label}
            </span>
        </label>
    );
}