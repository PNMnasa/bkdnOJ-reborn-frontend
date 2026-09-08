import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";

import { __ls_get_access_token } from "helpers/localStorageHelpers";
import "./PDFViewer.css";

interface PDFViewerProps {
  pdf?: string | null;
}

function PDFViewer({ pdf }: PDFViewerProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pdfUrl = pdf as string | undefined;

  let httpHeaders: Record<string, string> = {};
  const access_token = __ls_get_access_token();
  if (access_token) {
    httpHeaders["Authorization"] = "Bearer " + access_token;
  }

  return (
    <div className="problem-detail-pdf-container">
      {pdf ? (
        <Worker workerUrl={pdfjsWorkerUrl}>
          <Viewer
            fileUrl={pdfUrl!}
            defaultScale={SpecialZoomLevel.PageWidth}
            withCredentials={true}
            httpHeaders={httpHeaders}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
      ) : (
        <h4>PDF Not Available</h4>
      )}
    </div>
  );
}
export default PDFViewer;