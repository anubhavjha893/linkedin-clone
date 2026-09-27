import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader, Search, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const SearchBar = () => {
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 300);
		return () => clearTimeout(timeout);
	}, [query]);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const { data: results, isFetching } = useQuery({
		queryKey: ["userSearch", debouncedQuery],
		queryFn: async () => {
			const res = await axiosInstance.get(`/users/search?q=${encodeURIComponent(debouncedQuery)}`);
			return res.data;
		},
		enabled: debouncedQuery.length > 0,
	});

	const handleSelect = (username) => {
		setQuery("");
		setDebouncedQuery("");
		setIsOpen(false);
		navigate(`/profile/${username}`);
	};

	const showDropdown = isOpen && debouncedQuery.length > 0;

	return (
		<div ref={containerRef} className='relative w-full max-w-xs hidden sm:block'>
			<div className='relative'>
				<Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-info' />
				<input
					type='text'
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setIsOpen(true);
					}}
					onFocus={() => setIsOpen(true)}
					placeholder='Search people'
					className='w-full pl-9 pr-8 py-1.5 rounded-full bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
				/>
				{query && (
					<button
						onClick={() => {
							setQuery("");
							setDebouncedQuery("");
						}}
						className='absolute right-2.5 top-1/2 -translate-y-1/2 text-info hover:text-neutral'
						aria-label='Clear search'
					>
						<X size={14} />
					</button>
				)}
			</div>

			{showDropdown && (
				<div className='absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-base-300 max-h-80 overflow-y-auto z-30'>
					{isFetching ? (
						<div className='flex items-center justify-center py-4 text-info'>
							<Loader size={16} className='animate-spin' />
						</div>
					) : results?.length > 0 ? (
						results.map((user) => (
							<button
								key={user._id}
								onClick={() => handleSelect(user.username)}
								className='w-full flex items-center gap-3 px-3 py-2 hover:bg-base-100 transition-colors text-left'
							>
								<img
									src={user.profilePicture || "/avatar.png"}
									alt={user.name}
									className='size-9 rounded-full object-cover flex-shrink-0'
								/>
								<div className='min-w-0'>
									<p className='font-medium text-sm truncate'>{user.name}</p>
									<p className='text-xs text-info truncate'>{user.headline}</p>
								</div>
							</button>
						))
					) : (
						<p className='px-3 py-4 text-sm text-info text-center'>No people found</p>
					)}
				</div>
			)}
		</div>
	);
};

export default SearchBar;
