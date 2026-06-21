import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { booksApi } from "../api"
import { BookCard } from "../components/BookCard"
import { useForm } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Book } from "../types"
import { BOOK_COLOR_PRESETS, getBookPalette } from "../lib/bookPresets"

// ── Zod schema ────────────────────────────────────────────────────────────────

const bookSchema = z.object({
	title: z.string().min(1, "El título es obligatorio").max(100),
	description: z.string().max(500).optional(),
	isPublic: z.boolean().optional(),
	colorPreset: z.string().optional().nullable(),
})

type BookFormData = {
	title: string
	description?: string
	isPublic?: boolean
	colorPreset?: string | null
}

// ── BookFormModal ─────────────────────────────────────────────────────────────

function BookFormModal({
	initial,
	onClose,
	onSubmit,
}: {
	initial?: Book
	onClose: () => void
	onSubmit: (data: BookFormData) => Promise<void>
}) {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<BookFormData>({
		resolver: zodResolver(bookSchema) as Resolver<BookFormData>,
		defaultValues: {
			title: initial?.title || "",
			description: initial?.description || "",
			isPublic: initial?.isPublic ?? false,
			colorPreset: initial
				? initial.colorPreset || ""
				: BOOK_COLOR_PRESETS[0].id,
		},
	})

	const colorPreset = watch("colorPreset") || ""
	const previewBook = {
		title: watch("title") || initial?.title || "Nueva colección",
		coverColor: initial?.coverColor ?? null,
		colorPreset: colorPreset || null,
	}
	const previewPalette = getBookPalette(previewBook)

	const submit = (data: BookFormData) =>
		onSubmit({ ...data, colorPreset: data.colorPreset || null })

	return (
		<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
			<div
				className="rounded-2xl border border-[var(--color-border)] w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]"
				style={{ background: "var(--color-surface)" }}
			>
				{/* Header */}
				<div className="px-6 pt-6 pb-4 border-b border-[var(--color-border)] shrink-0">
					<h2 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
						{initial ? "Editar colección" : "Nueva colección"}
					</h2>
				</div>

				{/* Scrollable body */}
				<div className="overflow-y-auto flex-1 px-6 py-5">
					<form
						id="book-form"
						onSubmit={handleSubmit(submit)}
						className="space-y-5"
					>
						{/* Título */}
						<div>
							<label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
								Título *
							</label>
							<input
								{...register("title")}
								className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)]"
								placeholder="Mi lista de lectura 2024"
							/>
							{errors.title && (
								<p className="text-red-400 text-xs mt-1">
									{errors.title.message}
								</p>
							)}
						</div>

						{/* Descripción */}
						<div>
							<label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
								Descripción
							</label>
							<textarea
								{...register("description")}
								rows={2}
								className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mauve)] resize-none"
								placeholder="¿De qué trata esta colección?"
							/>
						</div>

						{/* Visibilidad */}
						<label className="flex items-center gap-3 cursor-pointer">
							<input
								{...register("isPublic")}
								type="checkbox"
								className="w-4 h-4 accent-[var(--color-accent)]"
							/>
							<span className="text-sm text-[var(--color-ink)]">
								Hacer esta colección pública
							</span>
						</label>

						{/* ── Estilo del libro ─────────────────────────────────── */}
						<div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-parchment)] p-4 space-y-4">
							<h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
								Estilo del libro
							</h3>

							<input
								type="hidden"
								{...register("colorPreset")}
							/>

							<div
								className="rounded-lg border border-[var(--color-border)] overflow-hidden"
								style={{ background: previewPalette.page }}
							>
								<div className="flex min-h-24">
									<div
										className="w-16 shrink-0"
										style={{ background: previewPalette.spine }}
									/>
									<div
										className="w-24 shrink-0 flex items-center justify-center px-3"
										style={{
											background: `linear-gradient(135deg, ${previewPalette.cover}, ${previewPalette.spine})`,
										}}
									>
										<span className="font-display text-center text-xs font-bold leading-tight text-white">
											{previewBook.title}
										</span>
									</div>
									<div className="flex-1 p-4 space-y-2">
										<div
											className="h-2 rounded-full w-2/3"
											style={{ background: previewPalette.accent }}
										/>
										<div
											className="h-px w-full"
											style={{ background: previewPalette.pageLine }}
										/>
										<div
											className="h-px w-5/6"
											style={{ background: previewPalette.pageLine }}
										/>
										<div
											className="h-px w-3/4"
											style={{ background: previewPalette.pageLine }}
										/>
									</div>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
									Estilo
								</label>
								<div className="grid grid-cols-2 gap-2">
									{BOOK_COLOR_PRESETS.map((preset) => (
										<button
											key={preset.id}
											type="button"
											onClick={() => setValue("colorPreset", preset.id)}
											className="rounded-lg border p-2 text-left transition-transform hover:-translate-y-0.5"
											style={{
												background:
													colorPreset === preset.id
														? "var(--color-surface)"
														: "rgba(255,255,255,0.45)",
												borderColor:
													colorPreset === preset.id
														? "var(--color-accent)"
														: "var(--color-border)",
												boxShadow:
													colorPreset === preset.id
														? "0 0 0 1px rgba(24,49,35,0.18)"
														: "none",
											}}
										>
											<div className="flex items-center gap-2">
												<span
													className="flex overflow-hidden rounded border border-black/10"
													style={{ width: "100%", height: 22 }}
												>
													<span
														className="flex-1"
														style={{ background: preset.spine }}
													/>
													<span
														className="flex-1"
														style={{ background: preset.cover }}
													/>
													<span
														className="flex-1"
														style={{ background: preset.page }}
													/>
												</span>
											</div>
										</button>
									))}
								</div>
								{initial && !initial.colorPreset && initial.coverColor && (
									<p className="mt-2 text-xs text-[var(--color-ink-light)]">
										Este libro conserva un color anterior hasta que elijas un
										preset.
									</p>
								)}
							</div>
						</div>
					</form>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-[var(--color-border)] shrink-0 flex gap-3">
					<button
						type="submit"
						form="book-form"
						disabled={isSubmitting}
						className="flex-1 py-2.5 rounded-lg bg-[var(--color-btn-primary)] text-white font-medium hover:bg-[var(--color-btn-primary-hover)] disabled:opacity-50 transition-colors"
					>
						{isSubmitting ? "Guardando..." : initial ? "Actualizar" : "Crear"}
					</button>
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-ink-light)] text-sm hover:bg-[var(--color-parchment)] transition-colors"
					>
						Cancelar
					</button>
				</div>
			</div>
		</div>
	)
}

// ── MyBooksPage ───────────────────────────────────────────────────────────────

export function MyBooksPage() {
	const qc = useQueryClient()
	const navigate = useNavigate()
	const [showCreate, setShowCreate] = useState(false)
	const [editing, setEditing] = useState<Book | null>(null)

	const { data, isLoading } = useQuery({
		queryKey: ["myBooks"],
		queryFn: () => booksApi.getMyBooks().then((r) => r.data),
	})

	const createMutation = useMutation({
		mutationFn: (d: BookFormData) => booksApi.createBook(d),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["myBooks"] })
			setShowCreate(false)
		},
	})

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: BookFormData }) =>
			booksApi.updateBook(id, data),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: ["myBooks"] })
			qc.invalidateQueries({ queryKey: ["book", id] })
			setEditing(null)
		},
	})

	const deleteMutation = useMutation({
		mutationFn: (id: string) => booksApi.deleteBook(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["myBooks"] }),
	})

	const togglePublic = useMutation({
		mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
			booksApi.updateBook(id, { isPublic }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["myBooks"] }),
	})

	return (
		<div className="max-w-5xl mx-auto px-4 py-10">
			<div className="flex items-center justify-between mb-10">
				<h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">
					MIS COLECCIONES
				</h1>
				<button
					onClick={() => setShowCreate(true)}
					className="px-5 py-2 rounded-full bg-[var(--color-btn-primary)] text-white text-sm font-medium hover:bg-[var(--color-btn-primary-hover)] transition-colors"
					style={{ cursor: "pointer" }}
				>
					+ Nueva colección
				</button>
			</div>

			{isLoading && (
				<div className="flex flex-wrap gap-10">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="w-36 h-52 rounded bg-[var(--color-border)] animate-pulse"
						/>
					))}
				</div>
			)}

			{!isLoading && (!data?.books || data.books.length === 0) && (
				<div className="text-center py-20 text-[var(--color-ink-light)]">
					<p className="text-lg mb-2">Sin colecciones todavía.</p>
					<p className="text-sm">¡Crea tu primera colección de lectura!</p>
				</div>
			)}

			{!isLoading && data && data.books.length > 0 && (
				<div className="flex flex-wrap gap-10">
					{data.books.map((book) => (
						<div
							key={book.id}
							className="relative group/book"
							style={{ width: "140px" }}
						>
							<BookCard
								book={book}
								showUser={false}
								linkTo={`/my-books/${book.id}`}
								actions={
									<>
										{/* Ver lecturas — primario */}
										<button
											onClick={(e) => {
												e.preventDefault()
												e.stopPropagation()
												navigate(`/my-books/${book.id}`)
											}}
											className="w-28 py-2 rounded-md text-xs font-semibold transition-colors duration-150 bg-white/15 hover:bg-white/28 text-white border border-white/30 hover:border-white/50"
										>
											Ver lecturas →
										</button>

										{/* Editar */}
										<button
											onClick={(e) => {
												e.preventDefault()
												e.stopPropagation()
												setEditing(book)
											}}
											className="w-28 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 bg-[#3F6E50]/85 hover:bg-[#315A40]/95 text-white border border-[#ADEEC5]/50 hover:border-[#ADEEC5]/80"
										>
											Editar
										</button>

										{/* Público / Privado */}
										<button
											onClick={(e) => {
												e.preventDefault()
												e.stopPropagation()
												togglePublic.mutate({
													id: book.id,
													isPublic: !book.isPublic,
												})
											}}
											className="w-28 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 bg-[#EDBBAD]/90 hover:bg-[#EDADCA]/95 text-[#183123] border border-[#ADEEC5]/50 hover:border-[#ADEEC5]/80"
										>
											{book.isPublic ? "Hacer privado" : "Hacer público"}
										</button>

										{/* Eliminar */}
										<button
											onClick={(e) => {
												e.preventDefault()
												e.stopPropagation()
												if (confirm(`¿Eliminar "${book.title}"?`))
													deleteMutation.mutate(book.id)
											}}
											className="w-28 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 bg-[#8E3347]/85 hover:bg-[#6E2637]/95 text-white border border-[#EDADCA]/50 hover:border-[#EDADCA]/80"
										>
											Eliminar
										</button>
									</>
								}
							/>
						</div>
					))}
				</div>
			)}

			{showCreate && (
				<BookFormModal
					onClose={() => setShowCreate(false)}
					onSubmit={(d) => createMutation.mutateAsync(d).then(() => {})}
				/>
			)}

			{editing && (
				<BookFormModal
					initial={editing}
					onClose={() => setEditing(null)}
					onSubmit={(d) =>
						updateMutation
							.mutateAsync({ id: editing.id, data: d })
							.then(() => {})
					}
				/>
			)}
		</div>
	)
}
