import { useState } from "react";
import { Search, Filter, Calendar, User, Tag, MapPin, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EnhancedCard from "./enhanced-card";
import EnhancedButton from "./enhanced-button";

interface SearchFilters {
  query: string;
  status: string[];
  types: string[];
  dateRange: {
    from: string;
    to: string;
  };
  amountRange: {
    min: number;
    max: number;
  };
  reporter: string;
  tags: string[];
  location: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  className?: string;
}

export default function AdvancedSearch({ onSearch, onClear, className = "" }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    status: [],
    types: [],
    dateRange: { from: "", to: "" },
    amountRange: { min: 0, max: 1000000 },
    reporter: "",
    tags: [],
    location: ""
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      query: "",
      status: [],
      types: [],
      dateRange: { from: "", to: "" },
      amountRange: { min: 0, max: 1000000 },
      reporter: "",
      tags: [],
      location: ""
    });
    onClear();
  };

  const toggleStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const toggleType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-500" },
    { value: "verified", label: "Verified", color: "bg-green-500" },
    { value: "resolved", label: "Resolved", color: "bg-blue-500" },
    { value: "rejected", label: "Rejected", color: "bg-red-500" },
    { value: "appealed", label: "Appealed", color: "bg-purple-500" }
  ];

  const typeOptions = [
    { value: "financial_scam", label: "Financial Scam" },
    { value: "identity_theft", label: "Identity Theft" },
    { value: "fake_services", label: "Fake Services" },
    { value: "account_fraud", label: "Account Fraud" },
    { value: "other", label: "Other" }
  ];

  return (
    <EnhancedCard className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Basic Search */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search cases, IDs, descriptions..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="pl-10 oa-input"
            />
          </div>
          <EnhancedButton
            variant="secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>{isExpanded ? "Simple" : "Advanced"}</span>
          </EnhancedButton>
          <EnhancedButton variant="primary" onClick={handleSearch}>
            Search
          </EnhancedButton>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t border-oa-surface animate-slide-in-up">
            {/* Status Filters */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(status => (
                  <button
                    key={status.value}
                    onClick={() => toggleStatus(status.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      filters.status.includes(status.value)
                        ? `${status.color} text-white`
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filters */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">Case Types</label>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map(type => (
                  <button
                    key={type.value}
                    onClick={() => toggleType(type.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      filters.types.includes(type.value)
                        ? "bg-red-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  From Date
                </label>
                <Input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: e.target.value }
                  }))}
                  className="oa-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">To Date</label>
                <Input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: e.target.value }
                  }))}
                  className="oa-input"
                />
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Amount Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Min amount"
                  value={filters.amountRange.min || ""}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    amountRange: { ...prev.amountRange, min: parseInt(e.target.value) || 0 }
                  }))}
                  className="oa-input"
                />
                <Input
                  type="number"
                  placeholder="Max amount"
                  value={filters.amountRange.max || ""}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    amountRange: { ...prev.amountRange, max: parseInt(e.target.value) || 1000000 }
                  }))}
                  className="oa-input"
                />
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Reporter
                </label>
                <Input
                  placeholder="Reporter name or ID"
                  value={filters.reporter}
                  onChange={(e) => setFilters(prev => ({ ...prev, reporter: e.target.value }))}
                  className="oa-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </label>
                <Input
                  placeholder="City, state, or country"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="oa-input"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <EnhancedButton variant="secondary" onClick={handleClear}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </EnhancedButton>
              <div className="space-x-2">
                <EnhancedButton variant="secondary" onClick={() => setIsExpanded(false)}>
                  Cancel
                </EnhancedButton>
                <EnhancedButton variant="primary" onClick={handleSearch}>
                  Apply Filters
                </EnhancedButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </EnhancedCard>
  );
}