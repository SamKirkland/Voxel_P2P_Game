import React, { Suspense } from "react"
const Admin = React.lazy(() => import("./Admin"));
const WelcomeScreen = React.lazy(() => import("./WelcomeScreen"));

const isAdminPage = window.location.pathname === "/admin";

function App() {
	if (isAdminPage) {
		return (
			<Suspense fallback={<div>Loading...</div>}>
				<Admin />
			</Suspense>
		);
	}

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<WelcomeScreen />
		</Suspense>
	);
}

export default App;
