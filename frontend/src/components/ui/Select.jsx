import { Button, MenuItem } from "@blueprintjs/core";
import { Select as BpSelect } from "@blueprintjs/select";

/**
 * @typedef {{ value: any, label: string, disabled?: boolean }} SelectOption
 */

/**
 * @param {{
 *   value?: any,
 *   onValueChange?: (val: any) => void,
 *   options?: SelectOption[],
 *   placeholder?: string,
 *   className?: string,
 *   disabled?: boolean,
 *   alignText?: import("@blueprintjs/core").Alignment
 * }} props
 */
export function Select({
	value,
	onValueChange,
	options = [],
	placeholder = "Select...",
	className = "",
	disabled = false,
	alignText = "left",
}) {
	const selected =
		options.find((opt) => String(opt.value) === String(value)) || null;

	/** @type {import("@blueprintjs/select").ItemRenderer<SelectOption>} */
	const renderItem = (item, { handleClick, modifiers }) => {
		if (!modifiers.matchesPredicate) return null;
		const isSelected = selected?.value === item.value;
		return (
			<MenuItem
				key={String(item.value)}
				text={item.label}
				active={modifiers.active}
				selected={isSelected}
				icon={isSelected ? "tick" : "blank"}
				disabled={Boolean(item.disabled)}
				onClick={handleClick}
				shouldDismissPopover
			/>
		);
	};

	return (
		<BpSelect
			items={options}
			itemRenderer={renderItem}
			filterable={false}
			activeItem={selected}
			onItemSelect={(item) => onValueChange?.(item.value)}
			disabled={disabled}
			popoverProps={{
				matchTargetWidth: true,
				minimal: true,
				transitionDuration: 0,
			}}
			className={className}>
			<Button
				variant="outlined"
				fill
				alignText={alignText}
				disabled={disabled}
				endIcon="double-caret-vertical"
				text={selected ? selected.label : placeholder}
			/>
		</BpSelect>
	);
}
