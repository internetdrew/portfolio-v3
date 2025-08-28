import { ModeToggle } from "@/components/ModeToggle";

const Navbar = () => {
  return (
    <nav className="bg-background px-4 py-3 sticky top-0 z-10 sm:py-4">
      <div className="max-w-screen-md mx-auto flex justify-between items-center">
        <a href="/" className="font-semibold">
          Internet Drew
        </a>
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
