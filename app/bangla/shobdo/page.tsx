import { Suspense } from "react";
import WordSourceManager from "../../../components/Bangla/bengaliWordSource/BengaliWordSourceManager";

export default function Page() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <WordSourceManager />
        </Suspense>
    );
}
