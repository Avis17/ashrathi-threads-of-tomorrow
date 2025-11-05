import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateJobOrder, useUpdateJobOrder, useJobOrderDetails } from "@/hooks/useJobOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface JobOrderFormProps {
  jobOrderId?: string;
  onBack: () => void;
}

const JOB_TYPES = [
  "Fabric to Packing (Complete)",
  "Cutting Only",
  "Stitching Only",
  "Checking & Ironing",
  "Packing Only",
  "Custom (Partial Processes)",
];

export const JobOrderForm = ({ jobOrderId, onBack }: JobOrderFormProps) => {
  const { data: details } = useJobOrderDetails(jobOrderId);
  const createJobOrder = useCreateJobOrder();
  const updateJobOrder = useUpdateJobOrder();
  
  const isEdit = !!jobOrderId;
  const order = details?.order;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: order ? {
      client_company: order.client_company,
      contact_person: order.contact_person,
      contact_number: order.contact_number || "",
      job_type: order.job_type,
      product_name: order.product_name,
      total_pieces: order.total_pieces,
      delivery_date: order.delivery_date,
      start_date: order.start_date,
      remarks: order.remarks || "",
    } : {
      start_date: new Date().toISOString().split("T")[0],
    },
  });

  const jobType = watch("job_type");

  const onSubmit = (data: any) => {
    if (isEdit) {
      updateJobOrder.mutate({ id: jobOrderId, ...data }, {
        onSuccess: onBack,
      });
    } else {
      createJobOrder.mutate(data, {
        onSuccess: onBack,
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h2 className="text-2xl font-bold">{isEdit ? "Edit Job Order" : "Create New Job Order"}</h2>
        <p className="text-muted-foreground">Enter job order details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client_company">Client Company *</Label>
            <Input
              id="client_company"
              {...register("client_company", { required: "Client company is required" })}
              placeholder="Company A"
            />
            {errors.client_company && (
              <p className="text-sm text-destructive">{errors.client_company.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person *</Label>
            <Input
              id="contact_person"
              {...register("contact_person", { required: "Contact person is required" })}
              placeholder="Rajesh Kumar"
            />
            {errors.contact_person && (
              <p className="text-sm text-destructive">{errors.contact_person.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_number">Contact Number</Label>
            <Input
              id="contact_number"
              {...register("contact_number")}
              placeholder="+91-9876543210"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_type">Job Type *</Label>
            <Select
              value={jobType}
              onValueChange={(value) => setValue("job_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.job_type && (
              <p className="text-sm text-destructive">{errors.job_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              {...register("product_name", { required: "Product name is required" })}
              placeholder="Bloom Blush Kids Set"
            />
            {errors.product_name && (
              <p className="text-sm text-destructive">{errors.product_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_pieces">Total Pieces *</Label>
            <Input
              id="total_pieces"
              type="number"
              {...register("total_pieces", { 
                required: "Total pieces is required",
                valueAsNumber: true,
                min: { value: 1, message: "Must be at least 1" }
              })}
              placeholder="1000"
            />
            {errors.total_pieces && (
              <p className="text-sm text-destructive">{errors.total_pieces.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date *</Label>
            <Input
              id="start_date"
              type="date"
              {...register("start_date", { required: "Start date is required" })}
            />
            {errors.start_date && (
              <p className="text-sm text-destructive">{errors.start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_date">Delivery Date *</Label>
            <Input
              id="delivery_date"
              type="date"
              {...register("delivery_date", { required: "Delivery date is required" })}
            />
            {errors.delivery_date && (
              <p className="text-sm text-destructive">{errors.delivery_date.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks / Notes</Label>
          <Textarea
            id="remarks"
            {...register("remarks")}
            placeholder="Any special instructions, material sourcing details, etc."
            rows={3}
          />
        </div>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={createJobOrder.isPending || updateJobOrder.isPending}>
            {isEdit ? "Update Job Order" : "Create Job Order"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
