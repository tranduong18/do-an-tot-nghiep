import { Helmet } from "react-helmet-async";

type Props = {
    title: string;
    description?: string;
};

export default function PageHelmet({ title, description }: Props) {
    return (
        <Helmet>
            <title>{title}</title>
            {description && <meta name="description" content={description} />}
        </Helmet>
    );
}
