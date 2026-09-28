import { Info } from "lucide-react";

const TOP_STORIES = [
	{ title: "Hiring trends shift toward skills-based roles", meta: "4h ago • 9,812 readers" },
	{ title: "Remote-first teams report higher retention", meta: "1d ago • 4,579 readers" },
	{ title: "Tech layoffs slow as demand stabilizes", meta: "2d ago • 6,204 readers" },
	{ title: "Open-source funding reaches record high", meta: "2d ago • 1,456 readers" },
	{ title: "What recruiters look for in 2026", meta: "3d ago • 22,221 readers" },
];

const NewsWidget = () => {
	return (
		<div className='bg-secondary rounded-lg shadow p-4'>
			<div className='flex items-center justify-between mb-3'>
				<h2 className='font-semibold text-base'>LinkedIn News</h2>
				<Info size={16} className='text-info' />
			</div>
			<p className='text-xs font-semibold text-info mb-2'>Top stories</p>
			<ul className='space-y-3'>
				{TOP_STORIES.map((story) => (
					<li key={story.title}>
						<p className='text-sm font-medium leading-snug hover:text-primary cursor-pointer'>{story.title}</p>
						<p className='text-xs text-info mt-0.5'>{story.meta}</p>
					</li>
				))}
			</ul>
			<button className='text-xs font-medium text-info hover:text-primary mt-3 flex items-center gap-1'>
				Show more
			</button>
		</div>
	);
};

export default NewsWidget;
