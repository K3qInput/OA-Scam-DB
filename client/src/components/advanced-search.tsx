import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";

const searchSchema = z.object({
  query: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  severity: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  hasEvidence: z.boolean().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface AdvancedSearchProps {
  onSearch: (filters: SearchFormData) => void;
  onClear: () => void;
  loading?: boolean;
  resultCount?: number;
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "appealed", label: "Appealed" },
  { value: "resolved", label: "Resolved" },
  { value: "archived", label: "Archived" },
];

const typeOptions = [
  { value: "financial_scam", label: "Financial Scam" },
  { value: "fake_services", label: "Fake Services" },
  { value: "identity_theft", label: "Identity Theft" },
  { value: "account_fraud", label: "Account Fraud" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Other" },
];

const severityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const availableTags = [
  "Discord", "Minecraft", "Gaming", "Cryptocurrency", "NFT", "Commission", 
  "Service", "Freelance", "Server", "Bot", "Plugin", "Website"
];

export default function AdvancedSearch({ onSearch, onClear, loading, resultCount }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      tags: [],
      hasEvidence: false,
    },
  });

  const onSubmit = (data: SearchFormData) => {
    const searchData = {
      ...data,
      tags: selectedTags,
    };
    onSearch(searchData);
  };

  const handleClear = () => {
    form.reset();
    setSelectedTags([]);
    onClear();
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const hasActiveFilters = () => {
    const values = form.getValues();
    return Object.values(values).some(value => 
      value !== undefined && value !== "" && value !== false
    ) || selectedTags.length > 0;
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search
            </CardTitle>
            <CardDescription className="text-slate-400">
              Find cases with specific criteria
              {resultCount !== undefined && (
                <span className="ml-2 text-blue-400 font-medium">
                  ({resultCount} results)
                </span>
              )}
            </CardDescription>
          </div>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </CardHeader>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Search */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Search Query</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Search cases, users, descriptions..."
                            className="bg-slate-700 border-slate-600 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Status</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Any status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="">Any status</SelectItem>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Type</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Any type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="">Any type</SelectItem>
                            {typeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Severity</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Any severity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="">Any severity</SelectItem>
                            {severityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">From Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-slate-700 border-slate-600 text-white"
                            {...field}
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">To Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-slate-700 border-slate-600 text-white"
                            {...field}
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Amount Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Min Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            className="bg-slate-700 border-slate-600 text-white"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Max Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10000"
                            className="bg-slate-700 border-slate-600 text-white"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label className="text-slate-300">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTagToggle(tag)}
                        className="text-xs"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-blue-900 text-blue-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="hasEvidence"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-slate-300 font-normal">
                          Cases with evidence only
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Searching..." : "Search"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClear}
                      disabled={!hasActiveFilters()}
                    >
                      Clear Filters
                    </Button>
                  </div>
                  
                  {hasActiveFilters() && (
                    <Badge variant="secondary" className="bg-blue-900 text-blue-200">
                      Active filters
                    </Badge>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}