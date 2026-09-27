export const PostSkeleton = () => (
	<div className='bg-secondary rounded-lg shadow mb-4 p-4 animate-pulse'>
		<div className='flex items-center mb-4'>
			<div className='size-10 rounded-full bg-base-100 mr-3' />
			<div className='flex-1 space-y-2'>
				<div className='h-3 w-1/3 bg-base-100 rounded' />
				<div className='h-2 w-1/4 bg-base-100 rounded' />
			</div>
		</div>
		<div className='space-y-2 mb-4'>
			<div className='h-3 w-full bg-base-100 rounded' />
			<div className='h-3 w-5/6 bg-base-100 rounded' />
		</div>
		<div className='flex gap-6'>
			<div className='h-3 w-16 bg-base-100 rounded' />
			<div className='h-3 w-16 bg-base-100 rounded' />
			<div className='h-3 w-16 bg-base-100 rounded' />
		</div>
	</div>
);

export const CardSkeleton = () => (
	<div className='bg-white rounded-lg shadow p-4 flex items-center gap-4 animate-pulse'>
		<div className='size-14 rounded-full bg-base-100 flex-shrink-0' />
		<div className='flex-1 space-y-2'>
			<div className='h-3 w-1/2 bg-base-100 rounded' />
			<div className='h-2 w-1/3 bg-base-100 rounded' />
		</div>
	</div>
);

export const SidebarSkeleton = () => (
	<div className='bg-secondary rounded-lg shadow p-4 animate-pulse'>
		<div className='h-16 rounded-t-lg bg-base-100 -m-4 mb-0' />
		<div className='size-20 rounded-full bg-base-100 mx-auto mt-[-40px] border-4 border-secondary' />
		<div className='h-3 w-2/3 bg-base-100 rounded mx-auto mt-4' />
		<div className='h-2 w-1/2 bg-base-100 rounded mx-auto mt-2' />
	</div>
);
