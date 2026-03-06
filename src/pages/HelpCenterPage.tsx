import React, { useState, useEffect } from 'react';
import { getHelpResources, HelpResource, HelpResourceType } from '../lib/supabase/helpResourcesService';
import { PlayCircle, FileText, Video, Search, Star, ExternalLink, Download } from 'lucide-react';

function HelpCenterPage() {
    const [resources, setResources] = useState<HelpResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<HelpResourceType | 'all'>('all');

    useEffect(() => {
        fetchResources();
    }, [selectedType]);

    const fetchResources = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await getHelpResources({
                type: selectedType,
            });

            if (fetchError) {
                setError(fetchError);
            } else if (data) {
                setResources(data);
            }
        } catch (err) {
            setError('Ein unerwarteter Fehler ist aufgetreten.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'tutorial': return <PlayCircle className="h-6 w-6 text-primary-600" />;
            case 'pdf': return <FileText className="h-6 w-6 text-primary-600" />;
            case 'video': return <Video className="h-6 w-6 text-primary-600" />;
            default: return <Star className="h-6 w-6 text-primary-600" />;
        }
    };

    const getLabelForType = (type: string) => {
        switch (type) {
            case 'tutorial': return 'Tutorial';
            case 'pdf': return 'PDF-Download';
            case 'video': return 'Video';
            default: return 'Ressource';
        }
    };

    const filteredResources = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 relative overflow-hidden">
                {/* Dekorativer Hintergrund */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 right-[-10%] w-64 h-64 bg-primary-400 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 pt-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                            Hilfe-Center
                        </h1>
                        <p className="text-xl max-w-3xl mx-auto text-gray-300 leading-relaxed text-balance">
                            Willkommen im Ressourcen-Bereich. Hier findest du alle unsere PDF-Ratgeber, Video-Tutorials und exklusiven Checklisten.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                {/* Controls: Search and Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">

                        {/* Type Filters */}
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <button
                                onClick={() => setSelectedType('all')}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${selectedType === 'all'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                Alle Inhalte
                            </button>
                            <button
                                onClick={() => setSelectedType('tutorial')}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center ${selectedType === 'tutorial'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Tutorials
                            </button>
                            <button
                                onClick={() => setSelectedType('pdf')}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center ${selectedType === 'pdf'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                PDFs
                            </button>
                            <button
                                onClick={() => setSelectedType('video')}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center ${selectedType === 'video'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                <Video className="h-4 w-4 mr-2" />
                                Videos
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-80 shrink-0">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Ressourcen durchsuchen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow bg-gray-50 focus:bg-white"
                            />
                        </div>

                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-xl h-64 shadow-sm border border-gray-100 animate-pulse flex flex-col p-6">
                                <div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                                <div className="mt-auto h-10 bg-gray-200 rounded-lg w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-white p-12 rounded-xl border border-primary-100 text-center shadow-sm">
                        <div className="text-6xl mb-4">🐹</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Huch! Unsere Server-Hamster bauen noch die Regale auf...</h3>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            Es sieht so aus, als wären die Datenbank-Tabellen für diesen Bereich noch im Aufbau ({error}).
                            Die Inhalte folgen zeitnah!
                        </p>
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
                        <div className="text-6xl mb-4">🚧</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Hier wird noch fleißig gewerkelt!</h3>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            {searchTerm
                                ? 'Wir konnten keine Inhalte finden, die deinen Suchkriterien entsprechen. Versuche einen anderen Suchbegriff oder Filter.'
                                : 'Aktuell sind noch keine Daten hinterlegt. Unsere Redaktion arbeitet auf Hochtouren daran, diesen Bereich zeitnah mit spannenden Tutorials und PDFs zu füllen!'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-6 text-primary-600 font-medium hover:text-primary-700 hover:underline"
                            >
                                Suche zurücksetzen
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map((resource) => (
                            <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                                {/* Optional Thumbnail */}
                                {resource.thumbnail_url && (
                                    <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                                        <img
                                            src={resource.thumbnail_url}
                                            alt={resource.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm">
                                            {getIconForType(resource.type)}
                                            <span className="ml-1.5">{getLabelForType(resource.type)}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 flex-1 flex flex-col">
                                    {!resource.thumbnail_url && (
                                        <div className="flex items-center mb-4">
                                            <div className="bg-primary-50 p-2.5 rounded-lg mr-3 shadow-inner">
                                                {getIconForType(resource.type)}
                                            </div>
                                            <span className="text-sm font-semibold tracking-wide text-primary-700 uppercase">
                                                {getLabelForType(resource.type)}
                                            </span>
                                        </div>
                                    )}

                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                                        {resource.title}
                                    </h3>

                                    {resource.description && (
                                        <p className="text-gray-600 mb-6 line-clamp-3 text-sm flex-1">
                                            {resource.description}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gray-50 text-gray-900 text-sm font-medium rounded-lg hover:bg-primary-600 hover:text-white transition-colors group/btn border border-gray-200 hover:border-primary-600"
                                        >
                                            {resource.type === 'pdf' ? (
                                                <>
                                                    <Download className="h-4 w-4 mr-2 text-gray-500 group-hover/btn:text-white" />
                                                    PDF Aufrufen
                                                </>
                                            ) : (
                                                <>
                                                    <ExternalLink className="h-4 w-4 mr-2 text-gray-500 group-hover/btn:text-white" />
                                                    Ansehen
                                                </>
                                            )}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HelpCenterPage;
