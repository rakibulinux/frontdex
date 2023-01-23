import React, { useEffect, useRef, useState } from 'react';

const useDynamicSVGImport = (name: string) => {
    const ImportedIconRef = useRef<React.FC<React.SVGProps<SVGSVGElement>>>();
    const [error, setError] = useState<Error>();

    useEffect(() => {
        const importIcon = async (): Promise<void> => {
            try {
                ImportedIconRef.current = (
                  await import(`cryptocurrency-icons/svg/color/${name}.svg`) as any
                ).ReactComponent;
            } catch (err) {
                ImportedIconRef.current = (
                    await import('cryptocurrency-icons/svg/color/generic.svg') as any
                ).ReactComponent;
                setError(err as unknown as Error);
            }
        };

        importIcon();
    }, [name]);

    return { error, SvgIcon: ImportedIconRef.current };
}

interface CryptoSVGProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
}

export const CryptoSVG: React.FC<CryptoSVGProps> = ({
    name,
    className,
}: CryptoSVGProps) => {
    const { error, SvgIcon } = useDynamicSVGImport(name);

    const renderIcon = React.useMemo(() => {
        if (SvgIcon) {
            return <SvgIcon className={className} />;
        }

        return null;
    }, [error, SvgIcon, name]);

    return renderIcon;
};
