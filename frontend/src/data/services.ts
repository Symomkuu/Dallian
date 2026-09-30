export interface ServiceProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  eyebrow: string;
  shortDescription: string;
  fullDescription: string;
  pricing: string;
  duration: string;
  image: string;
  suitableFor: string[];
  keyHighlights: string[];
  processSteps: ServiceProcessStep[];
  benefits: string[];
  faqs: ServiceFAQ[];
  seoTitle: string;
  seoDescription: string;
}

export const servicesData: ServiceItem[] = [
  {
    id: 'wig-laundry',
    slug: 'wig-laundry',
    title: 'Wig Laundry & Deep Sanitization',
    shortTitle: 'Wig Laundry',
    tagline: 'Deep clarifying wash, intensive moisture bath, and lace grid purification.',
    eyebrow: 'Deep Spa Care',
    shortDescription:
      'A revitalizing spa cleanse for your human hair or Futura piece. We gently purge adhesive residue, scalp oils, and product buildup while locking in supple hydration.',
    fullDescription:
      'Over time, daily wear, styling sprays, makeup, and environmental dust build up inside your wig lace and strand cuticles, leaving hair stiff, dull, and prone to tangling. Our signature Dallian Wig Laundry service provides a delicate yet powerful restorative treatment. Using sulfate-free organic cleansers, argan-infused moisture baths, and sterile lace sanitization, we restore natural airflow, silky movement, and clean luxury fragrance to your piece.',
    pricing: 'From KSh 1,500',
    duration: '24 – 48 Hours',
    image: '/8a3f926d-4483-4271-8809-31d419bde337.jpg',
    suitableFor: [
      '100% Virgin & Raw Human Hair Wigs',
      'Japanese Futura Fibre Wigs',
      'Lace Frontal & Closure Pieces',
      'Wigs with heavy adhesive, glue, or makeup buildup',
    ],
    keyHighlights: [
      'Residue-free adhesive & glue removal',
      'Deep moisture cuticle-infusion bath',
      'Hygienic lace base sterilization',
      'Natural silk-luster restoration',
    ],
    processSteps: [
      {
        step: 1,
        title: 'Inspection & Detangling',
        description:
          'We inspect the lace integrity, cap elasticity, and fiber condition, followed by gentle wide-tooth detangling from ends to roots.',
      },
      {
        step: 2,
        title: 'Clarifying & Adhesive Dissolution',
        description:
          'Submerged in lukewarm clarifying bath with specialized solvents to melt stubborn lace glue, edge control, and oils without shedding.',
      },
      {
        step: 3,
        title: 'Deep Conditioning & Steam Treatment',
        description:
          'Infused with salon-grade botanical conditioners, followed by gentle ozone steaming to seal the hair cuticles with long-lasting moisture.',
      },
      {
        step: 4,
        title: 'Air-Dry & Protective Mist',
        description:
          'Slow ambient temperature drying on sculpted mannequin heads, finished with UV protective and antistatic shine mist.',
      },
    ],
    benefits: [
      'Eliminates odors and bacterial buildup inside the cap',
      'Restores lightweight, airy bounce and touchable softness',
      'Prevents premature lace tearing by keeping mesh soft and supple',
      'Extends the overall lifespan of your investment piece',
    ],
    faqs: [
      {
        question: 'How often should I bring my wig for professional laundry?',
        answer:
          'For daily worn wigs, we recommend laundry every 2 to 3 weeks. For occasional wear (weekends/events), a wash every 6 to 8 weeks keeps the hair fresh and tangle-free.',
      },
      {
        question: 'Can you wash synthetic Futura fibre wigs?',
        answer:
          'Yes! We use specialized low-pH synthetic cleansing formulas tailored specifically for Japanese Futura fibre to prevent static and preserve curl memory.',
      },
      {
        question: 'Do you offer pickup and delivery in Nairobi?',
        answer:
          'Yes, rider pickup and delivery across Nairobi (and countrywide parcel courier) is available upon request when booking via WhatsApp.',
      },
    ],
    seoTitle: 'Professional Wig Laundry & Deep Cleaning in Nairobi | Dallian Luxe Hair',
    seoDescription:
      'Revitalize your human hair and Futura wigs with Dallian Luxe Hair professional wig laundry service at Mountain Mall, Nairobi. Deep clarifying, conditioning, and sanitization.',
  },
  {
    id: 'styling-and-curling',
    slug: 'styling-and-curling',
    title: 'Styling, Thermal Curling & Crimping',
    shortTitle: 'Styling & Curling',
    tagline: 'Hollywood waves, defined spiral ringlets, bone straight glass finish, or custom crimps.',
    eyebrow: 'Thermal Styling',
    shortDescription:
      'Transform your piece with salon-grade thermal styling. From red-carpet Hollywood waves and voluminous barrel curls to mirror-shine bone straight silk pressing.',
    fullDescription:
      'Whether you are preparing for a wedding, high-profile photoshoot, corporate gala, or simply refreshing your everyday look, our expert stylists bring runway precision to your wig. Using temperature-regulated ceramic tools and thermal heat protectants, we sculpt lasting volume, defined curls, or pin-straight silkiness that holds up under humidity without damaging the delicate fibers.',
    pricing: 'From KSh 1,800',
    duration: 'Same Day / 24 Hours',
    image: '/2214af5c-9a6c-4846-b6aa-c860dc07471f.jpg',
    suitableFor: [
      'Human Hair Lace Wigs (All textures)',
      'Heat-Resistant Japanese Futura Wigs',
      'Pre-event / Photoshoot Wig Prep',
      'Restoring dropped or worn curls',
    ],
    keyHighlights: [
      'Precision thermal styling with ceramic tech',
      'Long-lasting humidity-resistant hold',
      'Zero heat damage guarantee',
      'Custom parting and baby hair definition',
    ],
    processSteps: [
      {
        step: 1,
        title: 'Texture Preparation & Heat Guard',
        description:
          'We coat each strand with a featherlight silicone-free thermal barrier that locks in moisture while shielding from temperatures up to 220°C.',
      },
      {
        step: 2,
        title: 'Root Lifting & Directional Blow-Out',
        description:
          'Strategic tension blow-drying lifts the crown, flattens the lace parting, and sets the natural direction of movement.',
      },
      {
        step: 3,
        title: 'Sculpting & Pin-Setting',
        description:
          'Using tourmaline barrels or titanium plates, we sculpt your chosen look and pin each curl to set the memory as it cools.',
      },
      {
        step: 4,
        title: 'Finishing Veil & Shine Lock',
        description:
          'Gently brushed out with a wide-tooth comb and locked with a flexible, touchable holding spray and luminous silk serum.',
      },
    ],
    benefits: [
      'Crisp, defined curls that retain shape for days',
      'Ultra-flat, scalp-like parting without bulky lumps',
      'Mirror-like glass hair finish with fluid movement',
      'Saves you hours of frustrating at-home heat styling',
    ],
    faqs: [
      {
        question: 'What styles can I choose from?',
        answer:
          'You can request Hollywood Glamour Waves, Loose Beachy Waves, Bouncy Curtain Bangs, Bone Straight Silk Press, Wand Curls, Mermaid Crimps, or Chic Blunt Bob styling.',
      },
      {
        question: 'Will heat styling damage my Futura fibre piece?',
        answer:
          'Our stylists use calibrated temperature settings (140°C–160°C) suited specifically for Futura fibre, ensuring your curls set permanently without melting or singeing.',
      },
      {
        question: 'Can I send a photo of the style I want?',
        answer:
          'Absolutely! When you book via WhatsApp or drop off your wig, simply share your reference photo and our stylists will match it.',
      },
    ],
    seoTitle: 'Wig Styling, Curling & Silk Press in Nairobi | Dallian Luxe Hair',
    seoDescription:
      'Expert wig styling, Hollywood waves, barrel curls, and bone straight pressing in Nairobi at Mountain Mall. Salon-grade thermal finishing for human hair and Futura wigs.',
  },
  {
    id: 'wig-installation',
    slug: 'wig-installation',
    title: 'Custom In-Studio Wig Installation & Melting',
    shortTitle: 'Wig Installation',
    tagline: 'Undetectable HD lace melting, scalp-toned custom prep, and flawless natural hairline blending.',
    eyebrow: 'In-Studio Fitting',
    shortDescription:
      'Experience a seamless, scalp-like melt. Includes professional braid down, skin-tone matching, lace customization, glueless or adhesive bonding, and personalized baby hair styling.',
    fullDescription:
      'A luxury wig deserves an equally exquisite installation. At the Dallian Luxe Hair Studio located at Mountain Mall, Nairobi, our master stylists turn your lace piece into an undetectable second skin. We focus on natural hair preservation under flat precision cornrows, custom bleach knot simulation, lace tinting matched to your exact undertone, and flawless melting that withstands all-day wear.',
    pricing: 'From KSh 2,500',
    duration: '1 – 2 Hours (Studio Session)',
    image: '/40609846-8a62-42e1-acfb-284505ec078e.jpg',
    suitableFor: [
      'First-time wig wearers wanting professional guidance',
      'Special events, weddings, parties, and photo sessions',
      'Glueless wearers wanting custom fit adjustment',
      'Long-wear lace frontal & 360 unit installations',
    ],
    keyHighlights: [
      'Ultra-flat foundation braid down',
      'Custom lace tinting & knot matching',
      'Gentle skin-safe melt (glueless or waterproof adhesive)',
      'Customized natural baby hairs or sleek edge finish',
    ],
    processSteps: [
      {
        step: 1,
        title: 'Scalp Prep & Flat Cornrows',
        description:
          'Your natural hair is nourished, moisturized, and braided into micro flat tracks to ensure the flattest possible wig base.',
      },
      {
        step: 2,
        title: 'Bald Cap & Complexion Toning',
        description:
          'A breathable stocking cap is fitted and tinted with custom pigments matching your exact scalp tone for seamless illusion.',
      },
      {
        step: 3,
        title: 'Lace Customization & Melting',
        description:
          'The wig is fitted, the lace trimmed with precision zig-zag shears, and melted into the skin using sweat-resistant adhesive or glueless melting bands.',
      },
      {
        step: 4,
        title: 'Edge Sculpting & Final Polish',
        description:
          'Customized hairline plucking, delicate baby hair sculpting, and final styling to match your preferred look.',
      },
    ],
    benefits: [
      '100% natural, undetectable hairline from any angle',
      'Secure, worry-free fit for active lifestyles and special occasions',
      'Protects your natural edges and hairline from tension damage',
      'Includes personalized maintenance advice from our top stylists',
    ],
    faqs: [
      {
        question: 'Do you offer glueless installations?',
        answer:
          'Yes! We specialize in both glueless installations (using elastic melting bands and skin-safe holding sprays) and extended adhesive melts.',
      },
      {
        question: 'How long does a wig install last?',
        answer:
          'A glueless installation can be removed daily or last 2 to 4 days with a melt band. An adhesive frontal install typically lasts 1 to 2 weeks with proper home care.',
      },
      {
        question: 'Do I need to book an appointment in advance?',
        answer:
          'Appointments are recommended to secure your preferred slot, but walk-ins at our Mountain Mall studio on Thika Road are warmly welcomed.',
      },
    ],
    seoTitle: 'Wig Installation & HD Lace Melting in Nairobi | Dallian Studio',
    seoDescription:
      'Book a luxury in-studio wig installation at Dallian Luxe Hair, Mountain Mall, Thika Road, Nairobi. HD lace melting, glueless install, braid downs, and edge styling.',
  },
  {
    id: 'wig-revamping',
    slug: 'wig-revamping',
    title: 'Complete Wig Revamping & Reconstruction',
    shortTitle: 'Wig Revamping',
    tagline: 'Comprehensive overhaul: deep detangling, lace repair, elastic renewal, silicone silk bath, and restyling.',
    eyebrow: 'Restoration & Repair',
    shortDescription:
      'Breathe brand-new life into old, frizzy, matte, or neglected wigs. We completely overhaul the cap, repair lace shedding, replace loose bands, and restore vibrant shine.',
    fullDescription:
      'Do not throw away your expensive human hair or favourite Futura wigs! Even heavily tangled, dry, or loose-fitting wigs can be restored to near-original perfection. Our comprehensive Revamping service is an intensive salon reconstruction treatment that removes split frizzy ends, replaces worn-out elastic bands, tightens loose tracks, treats fiber roughness with silicone silk infusion, and finishes with a bespoke cut and style.',
    pricing: 'From KSh 2,800',
    duration: '48 – 72 Hours',
    image: '/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg',
    suitableFor: [
      'Tangled, stiff, or matte human hair wigs',
      'Worn wigs with stretched-out elastic bands and loose clips',
      'Old wigs needing a modern cut, layers, or texture refresh',
      'Lace units with small tears or shedding in the parting space',
    ],
    keyHighlights: [
      'Strand-by-strand knot & tangle release',
      'Intensive silicone gloss fiber treatment',
      'Cap structural reconstruction & band renewal',
      'Micro-trimming of split and damaged ends',
    ],
    processSteps: [
      {
        step: 1,
        title: 'Deep Knot Extraction & De-frizzing',
        description:
          'Using specialized slip agents, we patiently detangle severe matting without snapping the delicate hair shafts.',
      },
      {
        step: 2,
        title: 'Cap Overhaul & Elastic Renewal',
        description:
          'We replace slack elastic straps, reinforce loose wefts, and secure wig combs for a snug, secure fit.',
      },
      {
        step: 3,
        title: 'Silicone Protein Bath & Cuticle Seal',
        description:
          'A multi-stage deep conditioning treatment that re-coats the hair shaft with glossy silicone smoothing agents.',
      },
      {
        step: 4,
        title: 'Precision Trim & Re-Styling',
        description:
          'We trim away frayed split ends and restyle the piece into fresh, voluminous body waves, curls, or straight silk.',
      },
    ],
    benefits: [
      'Saves you thousands of shillings compared to buying a new wig',
      'Restores the smooth, silky glide and touchable feel of the hair',
      'Ensures a snug, comfortable fit on your head with new elastic',
      'Gives your older wig collection a modern, revitalized aesthetic',
    ],
    faqs: [
      {
        question: 'Can any wig be revamped regardless of how old it is?',
        answer:
          'Most 100% human hair wigs can be revamped successfully multiple times. If the lace has massive holes or severe bald patches, our stylist will assess it and suggest the best repair options.',
      },
      {
        question: 'Can you change the style during revamping (e.g. straight to curls)?',
        answer:
          'Yes! Revamping includes full restyling of your choice (body waves, curls, straight, or a fresh chic bob trim).',
      },
      {
        question: 'How do I drop off my wig for revamping?',
        answer:
          'You can drop it off at our studio at Mountain Mall, Thika Road, Nairobi, or send it via rider / parcel courier.',
      },
    ],
    seoTitle: 'Wig Revamping & Restoration Services in Nairobi | Dallian Luxe Hair',
    seoDescription:
      'Restore dry, tangled, and worn wigs with Dallian Luxe Hair wig revamping service in Nairobi. Complete cap repair, deep silicone hydration, detangling, and restyling.',
  },
];

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  return servicesData.find((s) => s.slug === slug);
}
