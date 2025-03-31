import { Separator } from "@/components/ui/separator";
const PageFooter = () => {
  return <footer className="max-w-7xl mx-auto mt-16 text-center">
      <Separator className="mb-6" />
      <div className="text-sm text-muted-foreground">
        <p>© 2025 Jungle Cups Game. Part of the Jungleverse. All rights reserved.</p>
        <p className="mt-1">Powered by the Aptos blockchain. Developed by Proud Lion Studios.</p>
      </div>
    </footer>;
};
export default PageFooter;