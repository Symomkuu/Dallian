from pathlib import Path

root = Path('src/app')
replacements = {
    "from '../data/brand'": "from '@/data/brand'",
    "from '../data/products'": "from '@/data/products'",
    "from '../data/content'": "from '@/data/content'",
    "from '../data/admin'": "from '@/data/admin'",
    "from '../types'": "from '@/types'",
    "from '../contexts/StoreContext'": "from '@/contexts/StoreContext'",
    "from '../utils/format'": "from '@/utils/format'",
    "from '../components/PageHeader'": "from '@/components/PageHeader'",
    "from '../components/ProductCard'": "from '@/components/ProductCard'",
    "from '../components/ProductGallery'": "from '@/components/ProductGallery'",
    "from '../components/SectionHeading'": "from '@/components/SectionHeading'",
    "from '../components/ReviewCard'": "from '@/components/ReviewCard'",
    "from '../components/Newsletter'": "from '@/components/Newsletter'",
    "from '../components/CategoryCard'": "from '@/components/CategoryCard'",
    "from '../components/ui/Button'": "from '@/components/ui/Button'",
    "from '../components/ui/TextField'": "from '@/components/ui/TextField'",
    "from '../components/ui/EmptyState'": "from '@/components/ui/EmptyState'",
    "from '../components/ui/Accordion'": "from '@/components/ui/Accordion'",
    "from '../components/ui/StarRating'": "from '@/components/ui/StarRating'",
    "from '../components/ui/SelectField'": "from '@/components/ui/SelectField'",
    "from '../components/RouterCompat'": "from '@/components/RouterCompat'",
    "from '../../data/brand'": "from '@/data/brand'",
    "from '../../data/products'": "from '@/data/products'",
    "from '../../data/content'": "from '@/data/content'",
    "from '../../data/admin'": "from '@/data/admin'",
    "from '../../types'": "from '@/types'",
    "from '../../contexts/StoreContext'": "from '@/contexts/StoreContext'",
    "from '../../utils/format'": "from '@/utils/format'",
    "from '../../components/ui/Button'": "from '@/components/ui/Button'",
    "from '../../components/ui/TextField'": "from '@/components/ui/TextField'",
    "from '../../components/ui/EmptyState'": "from '@/components/ui/EmptyState'",
    "from '../../components/ui/SelectField'": "from '@/components/ui/SelectField'",
    "from '../../components/ui/Accordion'": "from '@/components/ui/Accordion'",
    "from '../../components/ui/StarRating'": "from '@/components/ui/StarRating'",
    "from '../../components/admin/AdminPageHeader'": "from '@/components/admin/AdminPageHeader'",
    "from '../../components/admin/StatCard'": "from '@/components/admin/StatCard'",
    "from '../../components/RouterCompat'": "from '@/components/RouterCompat'",
}

for p in sorted(root.rglob('*.tsx')):
    text = p.read_text(encoding='utf-8')
    updated = text
    for old, new in replacements.items():
        updated = updated.replace(old, new)

    if any(token in updated for token in ['useState', 'useEffect', 'useStore', 'useNavigate', 'useParams', 'useSearchParams']) and not updated.lstrip().startswith("'use client';"):
        updated = "'use client';\n" + updated

    if updated != text:
        p.write_text(updated, encoding='utf-8')
        print(f'updated {p}')
