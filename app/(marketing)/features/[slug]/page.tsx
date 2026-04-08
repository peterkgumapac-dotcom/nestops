import { notFound } from 'next/navigation'
import { FEATURES, FEATURE_SLUGS } from '../_data/features'
import { FeaturePage } from '../_components/FeaturePage'

export function generateStaticParams() {
  return FEATURE_SLUGS.map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const feature = FEATURES[params.slug]
  if (!feature) return {}
  return {
    title: `${feature.title} — AfterStay`,
    description: feature.subhead,
  }
}

export default function FeatureSlugPage({ params }: { params: { slug: string } }) {
  const feature = FEATURES[params.slug]
  if (!feature) notFound()
  return <FeaturePage feature={feature} />
}
