import React from 'react';
import { Helmet } from 'react-helmet';
import ogImage from '../../public/images/og-image.png';
import logoImage from '../../public/images/logo.png';

const SEO = ({ title, description, image, url }) => {
    const defaultTitle = "Degen Monk - Where Crypto Meets Enlightenment";
    const defaultDescription = "Your daily dose of crypto wisdom, trading insights, and market humor. Join the Degen Monk community for a unique blend of cryptocurrency knowledge and zen philosophy.";
    const defaultImage = ogImage;
    const defaultUrl = "https://www.degenmonk.com";

    const seoTitle = title || defaultTitle;
    const seoDescription = description || defaultDescription;
    const seoImage = image || defaultImage;
    const seoUrl = url || defaultUrl;

    // Structured data for the website
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Degen Monk",
        "url": seoUrl,
        "description": seoDescription,
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.degenmonk.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    // Structured data for the organization
    const organizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Degen Monk",
        "url": seoUrl,
        "logo": logoImage,
        "sameAs": [
            "https://twitter.com/degenmonk",
            "https://t.me/degenmonk",
            "https://discord.gg/degenmonk"
        ]
    };

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{seoTitle}</title>
            <meta name="description" content={seoDescription} />
            <meta name="keywords" content="cryptocurrency, crypto trading, blockchain, crypto wisdom, trading insights, crypto humor, degen monk, crypto comics, trading philosophy" />
            
            {/* Open Graph Meta Tags */}
            <meta property="og:title" content={seoTitle} />
            <meta property="og:description" content={seoDescription} />
            <meta property="og:image" content={seoImage} />
            <meta property="og:url" content={seoUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Degen Monk" />
            
            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seoTitle} />
            <meta name="twitter:description" content={seoDescription} />
            <meta name="twitter:image" content={seoImage} />
            
            {/* Additional Meta Tags */}
            <meta name="robots" content="index, follow" />
            <meta name="language" content="English" />
            <meta name="revisit-after" content="7 days" />
            <meta name="author" content="Degen Monk" />
            
            {/* Canonical URL */}
            <link rel="canonical" href={seoUrl} />
            
            {/* Favicon */}
            <link rel="icon" type="image/png" href={logoImage} />
            
            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(organizationData)}
            </script>
        </Helmet>
    );
};

export default SEO; 