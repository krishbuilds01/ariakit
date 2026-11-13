import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

function ProfileHovercard({
  label,
  nested,
}: {
  label: string;
  nested?: boolean;
}) {
  return (
    <Ariakit.HovercardProvider>
      <Ariakit.HovercardAnchor href={`#${label}`}>
        {label} anchor
      </Ariakit.HovercardAnchor>
      <Ariakit.Hovercard
        aria-label={`${label} card`}
        style={{ padding: 16, border: "1px solid", background: "white" }}
      >
        <Ariakit.Button>{label} button</Ariakit.Button>
        {nested ? (
          <Ariakit.HovercardProvider>
            <Ariakit.HovercardAnchor href={`#${label}-nested`}>
              {label} nested anchor
            </Ariakit.HovercardAnchor>
            <Ariakit.Hovercard
              aria-label={`${label} nested card`}
              style={{ padding: 16, border: "1px solid", background: "white" }}
            >
              <Ariakit.Button>{label} nested button</Ariakit.Button>
            </Ariakit.Hovercard>
          </Ariakit.HovercardProvider>
        ) : null}
      </Ariakit.Hovercard>
    </Ariakit.HovercardProvider>
  );
}

export default function Example() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const setHost = useCallback((host: HTMLDivElement | null) => {
    if (!host) {
      setContainer(null);
      return;
    }
    const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
    const element =
      shadow.querySelector<HTMLDivElement>("[data-react-portal]") ||
      host.ownerDocument.createElement("div");
    element.dataset.reactPortal = "";
    if (!element.isConnected) {
      shadow.append(element);
    }
    setContainer(element);
  }, []);

  return (
    <>
      <ProfileHovercard label="Light" />
      <div ref={setHost} />
      {container &&
        createPortal(<ProfileHovercard label="Shadow" nested />, container)}
    </>
  );
}
