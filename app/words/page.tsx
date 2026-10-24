import { Suspense } from "react";
import Words from "../../components/Word/Words";

export default function Page() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <Words />
        </Suspense>
    );
}
