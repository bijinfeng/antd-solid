import { MyButton, StyleTest } from "../../src";

export function App() {
	return (
		<>
			<MyButton type="primary" />
            <div style={{ padding: "20px" }}>
                <h3>CSS-in-JS Test:</h3>
                <StyleTest />
            </div>
		</>
	);
}
