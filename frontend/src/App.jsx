import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios";
import { SocketProvider } from "./context/SocketContext";
import { MessagingWidgetProvider } from "./context/MessagingContext";
import MessagingPopup from "./components/messages/MessagingPopup";

const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const NetworkPage = lazy(() => import("./pages/NetworkPage"));
const PostPage = lazy(() => import("./pages/PostPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const HashtagPage = lazy(() => import("./pages/HashtagPage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));

function App() {
	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await axiosInstance.get("/auth/me");
				return res.data;
			} catch (err) {
				if (err.response?.status === 401) {
					return null;
				}
				toast.error(err.response?.data?.message || "Can't reach the server. Please check your connection.");
				return null;
			}
		},
		retry: 1,
	});

	if (isLoading) return null;

	return (
		<SocketProvider userId={authUser?._id}>
			<MessagingWidgetProvider>
				<Layout>
					<Suspense fallback={null}>
						<Routes>
							<Route path='/' element={authUser ? <HomePage /> : <Navigate to={"/login"} />} />
							<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
							<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
							<Route path='/notifications' element={authUser ? <NotificationsPage /> : <Navigate to={"/login"} />} />
							<Route path='/network' element={authUser ? <NetworkPage /> : <Navigate to={"/login"} />} />
							<Route path='/jobs' element={authUser ? <JobsPage /> : <Navigate to={"/login"} />} />
							<Route path='/messages' element={authUser ? <MessagesPage /> : <Navigate to={"/login"} />} />
							<Route path='/messages/:userId' element={authUser ? <MessagesPage /> : <Navigate to={"/login"} />} />
							<Route path='/post/:postId' element={authUser ? <PostPage /> : <Navigate to={"/login"} />} />
							<Route path='/hashtag/:tag' element={authUser ? <HashtagPage /> : <Navigate to={"/login"} />} />
							<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />} />
						</Routes>
					</Suspense>
					<Toaster />
					{authUser && <MessagingPopup authUser={authUser} />}
				</Layout>
			</MessagingWidgetProvider>
		</SocketProvider>
	);
}

export default App;
