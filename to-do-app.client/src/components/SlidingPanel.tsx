import SlidingPane from "react-sliding-side-panel";

const SlidingPanel = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => (
    <SlidingPane
        isOpen={isOpen}
        title="Manage"
        onRequestClose={onClose}
        width="400px"
    >
        {children}
    </SlidingPane>
);
