import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { useNotifications } from '../../lib/notifications/NotificationContext';
import { useSubscription } from '../../lib/auth/useSubscription';

import NotificationBadge from '../ui/NotificationBadge';
import { SHOW_MARKTPLATZ_IN_NAVIGATION } from '../../lib/constants/featureFlags';
import {
  isJobsLinkNewBadgeActive,
  isMarktplatzLinkNewBadgeActive,
} from '../../lib/constants/navigationBadges';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, signOut, loading } = useAuth();
  const { unreadCount } = useNotifications();
  const { isPremiumUser } = useSubscription();


  const isActive = (path: string) => location.pathname === path;
  const jobsNewBadge = isJobsLinkNewBadgeActive();
  const marktplatzNewBadge =
    SHOW_MARKTPLATZ_IN_NAVIGATION && isMarktplatzLinkNewBadgeActive();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout fehlgeschlagen:', error);
      // Auch bei Fehler zur Startseite navigieren
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Bessere Owner-Prüfung mit Fallback
  const isOwner = userProfile?.user_type === 'owner' || (!userProfile && isAuthenticated);
  const isCaretaker = userProfile?.user_type === 'caretaker' ||
    userProfile?.user_type === 'dienstleister' ||
    userProfile?.user_type === 'tierarzt' ||
    userProfile?.user_type === 'hundetrainer' ||
    userProfile?.user_type === 'tierfriseur' ||
    userProfile?.user_type === 'physiotherapeut' ||
    userProfile?.user_type === 'ernaehrungsberater' ||
    userProfile?.user_type === 'tierfotograf' ||
    userProfile?.user_type === 'sonstige';

  // Debug: Log current state
  if (import.meta.env.DEV) {
    console.log('Header State:', {
      loading,
      isAuthenticated,
      hasUserProfile: !!userProfile,
      userType: userProfile?.user_type,
      calculatedIsOwner: isOwner,
      calculatedIsCaretaker: isCaretaker
    });
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/Image/Logos/tigube_logo.svg" alt="tigube Logo" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                {isOwner && (
                  <NavLink to="/dashboard-owner" isActive={isActive('/dashboard-owner')}>
                    Dashboard
                  </NavLink>
                )}
                {isCaretaker && (
                  <NavLink to="/dashboard-caretaker" isActive={isActive('/dashboard-caretaker')}>
                    Dashboard
                  </NavLink>
                )}
                <NavLink to="/suche" isActive={isActive('/suche')}>
                  Betreuer finden
                </NavLink>
                <NavLink
                  to="/gesuche"
                  isActive={isActive('/gesuche')}
                  aria-label={jobsNewBadge ? 'Gesuche, neu' : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    Gesuche
                    {jobsNewBadge ? (
                      <span
                        className="rounded bg-primary-600 px-1 py-0.5 text-[10px] font-bold uppercase leading-none text-white"
                        aria-hidden
                      >
                        NEW
                      </span>
                    ) : null}
                  </span>
                </NavLink>
                <div className="relative inline-block group">
                  <NavLink to="/dienstleister" isActive={isActive('/dienstleister')}>
                    Wo finde ich...?
                  </NavLink>
                  {!isPremiumUser && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-md z-50">
                      🔒 Premium
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-amber-500" />
                    </div>
                  )}
                </div>
                {SHOW_MARKTPLATZ_IN_NAVIGATION && (
                  <NavLink
                    to="/marktplatz"
                    isActive={location.pathname.startsWith('/marktplatz')}
                    aria-label={marktplatzNewBadge ? 'Marktplatz, neu' : undefined}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      Marktplatz
                      {marktplatzNewBadge ? (
                        <span
                          className="rounded bg-primary-600 px-1 py-0.5 text-[10px] font-bold uppercase leading-none text-white"
                          aria-hidden
                        >
                          NEW
                        </span>
                      ) : null}
                    </span>
                  </NavLink>
                )}
                <NavLink to="/blog" isActive={isActive('/blog')}>
                  tigube-Welt
                </NavLink>
                {/* Test-Dashboard-Link entfernt */}
                {!isPremiumUser && (
                  <NavLink to="/mitgliedschaften" isActive={isActive('/mitgliedschaften') || isActive('/preise')}>
                    Mitgliedschaften
                  </NavLink>
                )}
                <Link
                  to="/nachrichten"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-primary-700 border-b-2 border-transparent hover:border-gray-300 transition-colors relative"
                >
                  Nachrichten
                  <NotificationBadge count={unreadCount} className="ml-1" />
                </Link>

                <button
                  type="button"
                  className="ml-4 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  aria-label="Ausloggen"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <NavLink to="/fuer-tierhalter" isActive={isActive('/fuer-tierhalter')}>
                  Für Tierhalter:innen
                </NavLink>
                <NavLink to="/fuer-betreuungspersonen" isActive={isActive('/fuer-betreuungspersonen')}>
                  Für Betreuungspersonen
                </NavLink>
                <NavLink to="/faq" isActive={isActive('/faq')}>
                  FAQ
                </NavLink>
                <NavLink to="/ueber-uns" isActive={isActive('/ueber-uns')}>
                  Über uns
                </NavLink>
                <Link
                  to="/anmelden"
                  className="btn btn-outline"
                >
                  Login
                </Link>
                <Link
                  to="/registrieren"
                  className="btn btn-primary"
                >
                  Registrieren
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            onClick={toggleMenu}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-4 space-y-1 animate-fade-in">
              {isAuthenticated ? (
                <>
                  {isOwner && (
                    <MobileNavLink to="/dashboard-owner" isActive={isActive('/dashboard-owner')} onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </MobileNavLink>
                  )}
                  {isCaretaker && (
                    <MobileNavLink to="/dashboard-caretaker" isActive={isActive('/dashboard-caretaker')} onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </MobileNavLink>
                  )}
                  <MobileNavLink to="/suche" isActive={isActive('/suche')} onClick={() => setIsMenuOpen(false)}>
                    Betreuer finden
                  </MobileNavLink>
                  <MobileNavLink
                    to="/gesuche"
                    isActive={isActive('/gesuche')}
                    onClick={() => setIsMenuOpen(false)}
                    aria-label={jobsNewBadge ? 'Gesuche, neu' : undefined}
                  >
                    <span className="inline-flex items-center gap-2">
                      Gesuche
                      {jobsNewBadge ? (
                        <span
                          className="rounded bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-white"
                          aria-hidden
                        >
                          NEW
                        </span>
                      ) : null}
                    </span>
                  </MobileNavLink>
                  <div className="relative group">
                    <MobileNavLink to="/dienstleister" isActive={isActive('/dienstleister')} onClick={() => setIsMenuOpen(false)}>
                      Wo finde ich...?
                    </MobileNavLink>
                    {!isPremiumUser && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded-full">
                        🔒 Premium
                      </span>
                    )}
                  </div>
                  {SHOW_MARKTPLATZ_IN_NAVIGATION && (
                    <MobileNavLink
                      to="/marktplatz"
                      isActive={location.pathname.startsWith('/marktplatz')}
                      onClick={() => setIsMenuOpen(false)}
                      aria-label={marktplatzNewBadge ? 'Marktplatz, neu' : undefined}
                    >
                      <span className="inline-flex items-center gap-2">
                        Marktplatz
                        {marktplatzNewBadge ? (
                          <span
                            className="rounded bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-white"
                            aria-hidden
                          >
                            NEW
                          </span>
                        ) : null}
                      </span>
                    </MobileNavLink>
                  )}
                  <MobileNavLink to="/blog" isActive={isActive('/blog')} onClick={() => setIsMenuOpen(false)}>
                    tigube-Welt
                  </MobileNavLink>
                  {/* Test-Dashboard-Link entfernt (mobil) */}
                  {!isPremiumUser && (
                    <MobileNavLink
                      to="/mitgliedschaften"
                      isActive={isActive('/mitgliedschaften') || isActive('/preise')}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mitgliedschaften
                    </MobileNavLink>
                  )}
                  <Link
                    to="/nachrichten"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-700 relative"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Nachrichten
                    <NotificationBadge count={unreadCount} className="ml-1" />
                  </Link>

                  <button
                    type="button"
                    className="ml-3 text-gray-400 hover:text-red-600 transition-colors px-3 py-2 disabled:opacity-50"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                    disabled={isLoggingOut}
                    aria-label="Ausloggen"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/fuer-tierhalter" isActive={isActive('/fuer-tierhalter')} onClick={() => setIsMenuOpen(false)}>
                    Für Tierhalter:innen
                  </MobileNavLink>
                  <MobileNavLink to="/fuer-betreuungspersonen" isActive={isActive('/fuer-betreuungspersonen')} onClick={() => setIsMenuOpen(false)}>
                    Für Betreuungspersonen
                  </MobileNavLink>
                  <MobileNavLink to="/faq" isActive={isActive('/faq')} onClick={() => setIsMenuOpen(false)}>
                    FAQ
                  </MobileNavLink>
                  <MobileNavLink to="/ueber-uns" isActive={isActive('/ueber-uns')} onClick={() => setIsMenuOpen(false)}>
                    Über uns
                  </MobileNavLink>
                  <div className="pt-2 flex flex-col space-y-2">
                    <Link
                      to="/anmelden"
                      className="btn btn-outline w-full justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/registrieren"
                      className="btn btn-primary w-full justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrieren
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: React.ReactNode;
  'aria-label'?: string;
}

function NavLink({ to, isActive, children, 'aria-label': ariaLabel }: NavLinkProps) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200',
        isActive
          ? 'border-primary-500 text-gray-900'
          : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800'
      )}
    >
      {children}
    </Link>
  );
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

function MobileNavLink({ to, isActive, onClick, children, 'aria-label': ariaLabel }: MobileNavLinkProps) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={cn(
        'block px-3 py-2 rounded-md text-base font-medium',
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export default Header;