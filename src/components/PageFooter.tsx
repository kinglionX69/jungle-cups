
import { Separator } from "@/components/ui/separator";

const PageFooter = () => {
  return (
    <footer className="max-w-7xl mx-auto mt-16 text-center">
      <Separator className="mb-6" />
      <div className="text-sm text-muted-foreground">
        <p>© 2023 Jungle Cups Game. All rights reserved.</p>
        <p className="mt-1">
          Powered by the Aptos blockchain. Not affiliated with Aptos Foundation.
        </p>
      </div>
    </footer>
  );
};

export default PageFooter;
