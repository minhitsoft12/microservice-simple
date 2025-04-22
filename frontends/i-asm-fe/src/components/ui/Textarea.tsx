import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxCharacters?: number;
  maxRows?: number;
  showCharacterCount?: boolean;
  averageCharsPerRow?: number;
  autoLimitByRows?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      maxCharacters,
      maxRows = Infinity,
      showCharacterCount = false,
      averageCharsPerRow = 70, // Default estimate of chars per row
      autoLimitByRows = false,
      onChange,
      ...props
    },
    ref
  ) => {
    const [characterCount, setCharacterCount] = React.useState(0);
    const [effectiveMaxChars, setEffectiveMaxChars] =
      React.useState(maxCharacters);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = useCombinedRefs(ref, textareaRef);

    // Calculate max chars based on rows if autoLimitByRows is enabled
    React.useEffect(() => {
      if (autoLimitByRows && maxRows < Infinity) {
        // Set character limit based on maxRows and averageCharsPerRow
        const calculatedLimit = maxRows * averageCharsPerRow;
        // Use the stricter limit between maxCharacters and calculated limit
        setEffectiveMaxChars(
          maxCharacters
            ? Math.min(maxCharacters, calculatedLimit)
            : calculatedLimit
        );
      } else {
        setEffectiveMaxChars(maxCharacters);
      }
    }, [maxRows, maxCharacters, averageCharsPerRow, autoLimitByRows]);

    // Calculate actual line count and update character count
    const calculateMetrics = (text: string) => {
      const lines = text.split("\n");

      // Calculate additional line breaks from text wrapping
      if (textareaRef.current) {
        const computedStyle = window.getComputedStyle(textareaRef.current);
        const width =
          parseInt(computedStyle.width, 10) -
          parseInt(computedStyle.paddingLeft, 10) -
          parseInt(computedStyle.paddingRight, 10);

        // Approximate character width (can be refined based on font)
        const charWidth = parseInt(computedStyle.fontSize, 10) * 0.6;

        if (!isNaN(width) && !isNaN(charWidth) && charWidth > 0) {
          const charsPerLine = Math.floor(width / charWidth);

          // Count wrapped lines
          let totalLines = 0;
          for (const line of lines) {
            totalLines += Math.max(1, Math.ceil(line.length / charsPerLine));
          }

          // If actual line count would exceed maxRows, we can further refine the character limit
          if (autoLimitByRows && maxRows < Infinity && totalLines > maxRows) {
            const newLimit = Math.floor(text.length * (maxRows / totalLines));
            setEffectiveMaxChars(
              maxCharacters ? Math.min(maxCharacters, newLimit) : newLimit
            );
          }
        }
      }

      return text.length;
    };

    // Handle character count and enforce limits
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let value = e.target.value;

      // Enforce line limit
      if (maxRows < Infinity) {
        const lines = value.split("\n");
        if (lines.length > maxRows) {
          value = lines.slice(0, maxRows).join("\n");
          e.target.value = value;
        }
      }

      // Enforce character limit
      if (effectiveMaxChars && value.length > effectiveMaxChars) {
        value = value.slice(0, effectiveMaxChars);
        e.target.value = value;
      }

      // Update metrics
      const count = calculateMetrics(value);
      setCharacterCount(count);

      if (onChange) {
        onChange(e);
      }
    };

    // Initialize character count on component mount
    React.useEffect(() => {
      if (textareaRef.current) {
        const count = calculateMetrics(textareaRef.current.value);
        setCharacterCount(count);
      }
    }, []);

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-sm bg-input px-3 py-2 text-sm placeholder:text-placeholder border border-input focus-visible:outline-0 focus-visible:bg-background focus-visible:border-black disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={combinedRef}
          onChange={handleChange}
          {...props}
        />
        {showCharacterCount && (
          <div className="text-xs text-muted-foreground absolute bottom-2 right-2">
            {characterCount}
            {effectiveMaxChars ? ` / ${effectiveMaxChars}` : ""}
          </div>
        )}
      </div>
    );
  }
);

// Utility function to combine refs
function useCombinedRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return React.useCallback(
    (element: T) => {
      refs.forEach(ref => {
        if (!ref) return;

        if (typeof ref === "function") {
          ref(element);
        } else {
          (ref as React.MutableRefObject<T>).current = element;
        }
      });
    },
    [refs]
  );
}

Textarea.displayName = "Textarea";

export { Textarea };
