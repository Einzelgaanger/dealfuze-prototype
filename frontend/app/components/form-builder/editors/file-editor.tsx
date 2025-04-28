import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FileComponent } from "@deal-fuze/server";
import { BaseEditor, ComponentEditorProps } from "./base-editor";
import { useState } from "react";

export function FileEditor({
  component,
  onSave,
}: ComponentEditorProps<FileComponent>) {
  const [currentComponent, setCurrentComponent] = useState<{
    component: FileComponent;
  }>({
    component,
  });

  return (
    <BaseEditor
      currentComponent={currentComponent}
      setCurrentComponent={setCurrentComponent}
      onSave={onSave}
      options={{
        allowSetPersonality: false,
        allowSetMatching: false,
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="image-only"
            checked={currentComponent.component.image || false}
            onCheckedChange={(checked) =>
              setCurrentComponent({
                ...currentComponent,
                component: {
                  ...currentComponent.component,
                  image: checked as boolean,
                },
              })
            }
          />
          <Label htmlFor="image-only">Image Files Only</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="private-download"
            checked={currentComponent.component.privateDownload || false}
            onCheckedChange={(checked) =>
              setCurrentComponent({
                ...currentComponent,
                component: {
                  ...currentComponent.component,
                  privateDownload: checked as boolean,
                },
              })
            }
          />
          <Label htmlFor="private-download">Private Download</Label>
        </div>
        <div>
          <Label>File Pattern</Label>
          <Input
            value={currentComponent.component.filePattern || "*"}
            placeholder="*.pdf,*.doc,*.docx"
            onChange={(e) =>
              setCurrentComponent({
                ...currentComponent,
                component: {
                  ...currentComponent.component,
                  filePattern: e.target.value,
                },
              })
            }
          />
          <p className="text-sm text-gray-500 mt-1">
            Comma separated list of file patterns (e.g., *.jpg,*.png,*.pdf)
          </p>
        </div>
        <div>
          <Label>Maximum File Size</Label>
          <Input
            value={currentComponent.component.fileMaxSize || "10MB"}
            placeholder="10MB"
            onChange={(e) =>
              setCurrentComponent({
                ...currentComponent,
                component: {
                  ...currentComponent.component,
                  fileMaxSize: e.target.value,
                },
              })
            }
          />
          <p className="text-sm text-gray-500 mt-1">
            Maximum file size (e.g., 10MB, 1GB)
          </p>
        </div>
        <div>
          <Label>Minimum File Size</Label>
          <Input
            value={currentComponent.component.fileMinSize || "0KB"}
            placeholder="0KB"
            onChange={(e) =>
              setCurrentComponent({
                ...currentComponent,
                component: {
                  ...currentComponent.component,
                  fileMinSize: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="upload-only"
            checked={currentComponent.component.uploadOnly || false}
            onCheckedChange={(checked) =>
              setCurrentComponent({
                ...currentComponent,
                component: {
                  ...currentComponent.component,
                  uploadOnly: checked as boolean,
                },
              })
            }
          />
          <Label htmlFor="upload-only">Upload Only (No Download)</Label>
        </div>
      </div>
    </BaseEditor>
  );
}
