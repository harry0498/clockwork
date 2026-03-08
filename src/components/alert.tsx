interface AlertProps {
  message: string;
  variant: "error" | "success";
}

const variantStyles = {
  error: "bg-destructive/10 text-destructive",
  success: "bg-green-500/10 text-green-700 dark:text-green-400",
};

export function Alert({ message, variant }: AlertProps) {
  return (
    <div className={`text-sm p-3 rounded-md ${variantStyles[variant]}`}>
      {message}
    </div>
  );
}
