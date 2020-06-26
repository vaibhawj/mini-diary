import { Moment } from "moment-timezone";
import React, { PureComponent, ReactNode } from "react";
import DayPicker from "react-day-picker";
import MomentLocaleUtils from "react-day-picker/moment";

import { Entries, Weekday } from "../../../../types";
import { createDate, parseDate, toIndexDate } from "../../../../utils/dateFormat";
import { lang } from "../../../../utils/i18n";
import CalendarNavContainer from "../calendar-nav/CalendarNavContainer";

export interface StateProps {
	allowFutureEntries: boolean;
	dateSelected: Moment;
	entries: Entries;
	firstDayOfWeek: Weekday | null;
}

export interface DispatchProps {
	setDateSelected: (date: Moment) => void;
	selectEntry: (id: string) => void;
}

type Props = StateProps & DispatchProps;

export default class Calendar extends PureComponent<Props, {}> {
	constructor(props: Props) {
		super(props);

		// Function bindings
		this.onDateSelection = this.onDateSelection.bind(this);
		this.onEntrySelection = this.onEntrySelection.bind(this);
	}

	onDateSelection(date: Date): void {
		const { allowFutureEntries, setDateSelected } = this.props;
		const parsedDate = parseDate(date);
		const today = createDate();

		if (allowFutureEntries || parseDate(date).isSameOrBefore(today, "day")) {
			setDateSelected(parsedDate);
		}
	}

	onEntrySelection(id: string): void {
		const { selectEntry } = this.props;
		selectEntry(id)
	}

	render(): ReactNode {
		const { allowFutureEntries, dateSelected, entries, firstDayOfWeek } = this.props;

		const today = createDate();
		const daysWithEntries = Object.keys(entries);

		const hasEntry = (date: Date): boolean => {
			const indexDate = toIndexDate(parseDate(date));
			return daysWithEntries.includes(indexDate);
		};

		const dateSelectedObj = dateSelected.toDate();
		const todayObj = today.toDate();

		return (
			<div>
				<DayPicker
				month={dateSelectedObj}
				selectedDays={dateSelectedObj}
				disabledDays={allowFutureEntries ? null : { after: todayObj }}
				captionElement={(): null => null}
				modifiers={{ hasEntry }}
				firstDayOfWeek={firstDayOfWeek ?? undefined}
				locale={lang}
				localeUtils={MomentLocaleUtils}
				navbarElement={<CalendarNavContainer />}
				onDayClick={this.onDateSelection}
				/>
				<ul>
				{
					entries[toIndexDate(dateSelected)] && 
						entries[toIndexDate(dateSelected)].map(e => <li onClick={() => this.onEntrySelection(e.id)}>{e.id} {e.title}</li>)
				}
				</ul>
			</div>
		);
	}
}
