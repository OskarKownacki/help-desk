'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewTicketPage() {
	const router = useRouter()

	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [author, setAuthor] = useState('')
	const [urgency, setUrgency] = useState(1)

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setSuccess(false)

		if (!title || !content || !author) {
			setError('All fields are required.')
			setLoading(false)
			return
		}

		try {
			const res = await fetch('/api/tickets', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title,
					content,
					author,
					urgency: Number(urgency),
				}),
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data.error || 'Something went wrong while submitting the ticket.')
			}

			setSuccess(true)
			setTitle('')
			setContent('')

			setTimeout(() => {
				router.push('/')
			}, 2000)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className='min-h-screen flex items-center justify-center bg-[#071026] text-white p-4'>
			<div className='w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 shadow-2xl backdrop-blur-md'>
				<h1 className='text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent'>
					Create a New Ticket
				</h1>

				<p className='text-zinc-400 text-sm mt-1'>
					Describe your issue and our team will address it as quickly as possible.
				</p>

				<form onSubmit={handleSubmit} className='mt-6 flex flex-col gap-4'>
					{error && (
						<div className='p-3 bg-red-600/20 border border-red-500/50 text-red-200 text-sm rounded-lg'>{error}</div>
					)}

					{success && (
						<div className='p-3 bg-green-600/20 border border-green-500/50 text-green-200 text-sm rounded-lg'>
							Ticket created successfully! Redirecting...
						</div>
					)}

					<div className='flex flex-col gap-1'>
						<label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>Your Name / Email</label>

						<input
							type='text'
							className='bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors'
							placeholder='e.g. John Smith'
							value={author}
							onChange={e => setAuthor(e.target.value)}
							disabled={loading || success}
						/>
					</div>

					<div className='flex flex-col gap-1'>
						<label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>Ticket Subject</label>

						<input
							type='text'
							className='bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors'
							placeholder='Brief issue title'
							value={title}
							onChange={e => setTitle(e.target.value)}
							disabled={loading || success}
						/>
					</div>

					<div className='flex flex-col gap-1'>
						<label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>Priority</label>

						<select
							className='bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors cursor-pointer'
							value={urgency}
							onChange={e => setUrgency(Number(e.target.value))}
							disabled={loading || success}>
							<option value={1}>Low</option>
							<option value={2}>Medium</option>
							<option value={3}>High</option>
						</select>
					</div>

					<div className='flex flex-col gap-1'>
						<label className='text-xs font-semibold text-zinc-300 uppercase tracking-wider'>Issue Description</label>

						<textarea
							className='bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors resize-none'
							rows={4}
							placeholder='Please describe in detail what is not working...'
							value={content}
							onChange={e => setContent(e.target.value)}
							disabled={loading || success}
						/>
					</div>

					<button
						type='submit'
						disabled={loading || success}
						className='mt-2 w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium rounded-lg text-sm transition-colors shadow-lg shadow-sky-600/10 flex items-center justify-center gap-2'>
						{loading ? (
							<div className='animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full' />
						) : (
							'Submit Ticket'
						)}
					</button>
				</form>
			</div>
		</main>
	)
}
